"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Building2,
  Camera,
  CheckCircle2,
  Headset,
  Image as ImageLucide,
  Pencil,
  Save,
  Shield,
  UserRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PageLoader } from "@/components/ui/page-loader"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  computeAdminProfileCompletion,
  defaultAdminProfileForm,
  type AdminProfileForm,
} from "@/features/admin/admin-profile-data"
import { SectionTabs, type SectionTabItem } from "@/features/creator/shared/section-tabs"
import { cn } from "@/lib/utils"

type ProfileTab = "basic" | "professional" | "preferences"

const profileTabs: SectionTabItem<ProfileTab>[] = [
  { value: "basic", label: "Basic info", icon: UserRound },
  { value: "professional", label: "Org & access", icon: Building2 },
  { value: "preferences", label: "Notifications", icon: Headset },
]

function initialsFromName(name: string) {
  const trimmed = name.trim()
  if (trimmed.length === 0) return "AR"
  return trimmed
    .split(/\s+/)
    .map((part) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function fallback(value: string, placeholder: string) {
  return value.trim().length === 0 ? placeholder : value
}

export function AdminProfileView() {
  const router = useRouter()
  const [form, setForm] = useState<AdminProfileForm>(defaultAdminProfileForm)
  const [saved, setSaved] = useState(JSON.stringify(defaultAdminProfileForm))
  const [lastSavedAt, setLastSavedAt] = useState("Today, 5:45 PM")
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [tab, setTab] = useState<ProfileTab>("basic")

  const completion = useMemo(() => computeAdminProfileCompletion(form), [form])
  const hasUnsavedChanges = JSON.stringify(form) !== saved

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      try {
        const response = await fetch("/api/profile/me?role=admin")
        if (!response.ok) return
        const result = (await response.json()) as { data?: Partial<AdminProfileForm> | null }
        if (!isMounted || !result.data) return

        const merged = { ...defaultAdminProfileForm, ...result.data }
        setForm(merged)
        setSaved(JSON.stringify(merged))
      } catch {
        // Keep defaults when profile API is unavailable.
      } finally {
        if (isMounted) {
          setIsProfileLoading(false)
        }
      }
    }

    void loadProfile()
    return () => {
      isMounted = false
    }
  }, [])

  function updateField<Key extends keyof AdminProfileForm>(key: Key, value: AdminProfileForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function persistProfile(nextForm: AdminProfileForm) {
    setIsSaving(true)
    setSaveError(null)
    try {
      const response = await fetch("/api/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "admin",
          data: nextForm,
        }),
      })
      if (!response.ok) {
        const result = (await response.json()) as { error?: string; details?: string }
        const message = result.details ?? result.error ?? "Unable to save profile"
        setSaveError(message)
        toast.error("Profile save failed", { description: message })
        return
      }

      setSaved(JSON.stringify(nextForm))
      setLastSavedAt(new Date().toLocaleString())
      toast.success("Profile saved successfully")
      router.refresh()
    } catch {
      toast.error("Profile save failed", { description: "Please try again." })
    } finally {
      setIsSaving(false)
    }
  }

  function saveProfile() {
    void persistProfile(form)
  }

  async function uploadProfileImage(kind: "avatar" | "banner", file: File) {
    const setUploading = kind === "avatar" ? setIsUploadingAvatar : setIsUploadingBanner
    setUploading(true)
    setSaveError(null)

    try {
      const payload = new FormData()
      payload.append("kind", kind)
      payload.append("file", file)

      const response = await fetch("/api/profile/upload", {
        method: "POST",
        body: payload,
      })
      if (!response.ok) {
        const result = (await response.json()) as { error?: string; details?: string }
        const message = result.details ?? result.error ?? "Upload failed"
        setSaveError(message)
        toast.error("Image upload failed", { description: message })
        return
      }

      const result = (await response.json()) as { url?: string }
      if (!result.url) return

      const nextForm = {
        ...form,
        avatarUrl: kind === "avatar" ? result.url : form.avatarUrl,
        bannerUrl: kind === "banner" ? result.url : form.bannerUrl,
      }
      setForm(nextForm)
      await persistProfile(nextForm)
    } catch {
      toast.error("Image upload failed", { description: "Please try again." })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageLoader
        open={isProfileLoading || isSaving || isUploadingAvatar || isUploadingBanner}
        label={isProfileLoading ? "Loading profile..." : "Saving profile..."}
      />
      <AdminProfileHero
        form={form}
        completionPercent={completion.percent}
        hasUnsavedChanges={hasUnsavedChanges}
        lastSavedAt={lastSavedAt}
        isSaving={isSaving}
        isUploadingAvatar={isUploadingAvatar}
        isUploadingBanner={isUploadingBanner}
        saveError={saveError}
        onUploadAvatar={(file) => void uploadProfileImage("avatar", file)}
        onUploadBanner={(file) => void uploadProfileImage("banner", file)}
        onSave={saveProfile}
      />

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4 xl:sticky xl:top-6 xl:h-max">
          <AdminDirectoryPreviewCard form={form} />
          <AdminProfileChecklist form={form} />
        </div>

        <div className="space-y-4">
          <SectionTabs value={tab} onChange={setTab} items={profileTabs} />

          {tab === "basic" ? (
            <AdminBasicSection form={form} updateField={updateField} onSave={saveProfile} hasUnsavedChanges={hasUnsavedChanges} />
          ) : null}

          {tab === "professional" ? (
            <AdminProfessionalSection form={form} updateField={updateField} />
          ) : null}

          {tab === "preferences" ? (
            <AdminPreferencesSection form={form} updateField={updateField} />
          ) : null}
        </div>
      </section>
    </div>
  )
}

function AdminProfileHero({
  form,
  completionPercent,
  hasUnsavedChanges,
  lastSavedAt,
  isSaving,
  isUploadingAvatar,
  isUploadingBanner,
  saveError,
  onUploadAvatar,
  onUploadBanner,
  onSave,
}: {
  form: AdminProfileForm
  completionPercent: number
  hasUnsavedChanges: boolean
  lastSavedAt: string
  isSaving: boolean
  isUploadingAvatar: boolean
  isUploadingBanner: boolean
  saveError: string | null
  onUploadAvatar: (file: File) => void
  onUploadBanner: (file: File) => void
  onSave: () => void
}) {
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="relative overflow-hidden rounded-t-2xl">
        {form.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.bannerUrl}
            alt=""
            className="h-44 w-full object-cover sm:h-56"
          />
        ) : (
          <div className="relative flex h-44 w-full items-center justify-center bg-linear-to-br from-primary/20 via-violet-500/15 to-primary/10 sm:h-56">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageLucide className="size-4" />
              Optional banner for internal directory
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background/60 via-background/0 to-background/0" />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="absolute top-4 right-4 gap-1.5 bg-background/80 backdrop-blur-sm"
          onClick={() => bannerInputRef.current?.click()}
          disabled={isUploadingBanner}
        >
          <Camera className="size-3.5" />
          {isUploadingBanner ? "Uploading..." : "Change banner"}
        </Button>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onUploadBanner(file)
            event.currentTarget.value = ""
          }}
        />
      </div>

      <div className="flex flex-col gap-4 px-5 pb-5 pt-2 sm:flex-row sm:items-start sm:gap-6 sm:px-6 sm:pb-6 sm:pt-3">
        <div className="relative z-10 -mt-12 shrink-0 self-start">
          {form.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.avatarUrl}
              alt={form.displayName}
              className="size-24 rounded-full border-4 border-card bg-muted object-cover shadow-md ring-2 ring-background sm:size-28"
            />
          ) : (
            <span className="inline-flex size-24 items-center justify-center rounded-full border-4 border-card bg-primary/15 text-xl font-semibold text-primary shadow-md ring-2 ring-background sm:size-28">
              {initialsFromName(form.displayName)}
            </span>
          )}
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            aria-label="Change avatar"
            className="absolute right-1 bottom-1 rounded-full border-border bg-background shadow-sm ring-2 ring-background"
            onClick={() => avatarInputRef.current?.click()}
            disabled={isUploadingAvatar}
          >
            <Pencil className="size-3.5" />
          </Button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onUploadAvatar(file)
              event.currentTarget.value = ""
            }}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className={cn(
                  "text-2xl font-semibold tracking-tight sm:text-3xl",
                  form.displayName.trim() ? "text-foreground" : "text-muted-foreground/80"
                )}
              >
                {fallback(form.displayName, "Your display name")}
              </h2>
              <Badge variant="secondary" className="gap-1 bg-primary/15 text-primary">
                <Shield className="size-3" />
                Admin profile
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{fallback(form.jobTitle, "Job title")}</p>
            <p className="max-w-2xl text-sm text-foreground/80">
              {fallback(form.bio, "Add a short bio for the internal directory and on-call handoffs.")}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
              <Badge variant="secondary" className="bg-primary/15 text-primary">
                {completionPercent}% complete
              </Badge>
              <span
                className={cn(
                  hasUnsavedChanges ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground"
                )}
              >
                {hasUnsavedChanges ? "Unsaved changes" : `Saved · ${lastSavedAt}`}
              </span>
              {saveError ? <span className="text-destructive">{saveError}</span> : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-0.5">
            <Button onClick={onSave} disabled={!hasUnsavedChanges || isSaving}>
              <Save className="size-4" />
              {isSaving ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function AdminDirectoryPreviewCard({
  form,
}: {
  form: AdminProfileForm
}) {
  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Internal directory</CardTitle>
            <CardDescription className="text-xs">How teammates see you in admin tools.</CardDescription>
          </div>
          <Badge variant="outline" className="h-5 text-[10px]">
            Preview
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 py-4">
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
          {form.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.bannerUrl} alt="" className="h-20 w-full object-cover" />
          ) : (
            <div className="h-20 w-full bg-linear-to-br from-primary/25 via-accent/30 to-primary/10" />
          )}
          <div className="relative -mt-8 px-4 pb-4">
            {form.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.avatarUrl}
                alt=""
                className="size-14 rounded-full border-4 border-card object-cover"
              />
            ) : (
              <span className="inline-flex size-14 items-center justify-center rounded-full border-4 border-card bg-primary/15 text-sm font-semibold text-primary">
                {initialsFromName(form.displayName)}
              </span>
            )}
            <p
              className={cn(
                "mt-2 truncate text-sm font-semibold",
                form.displayName.trim() ? "text-foreground" : "text-muted-foreground/80"
              )}
            >
              {fallback(form.displayName, "Display name")}
            </p>
            <p className="truncate text-xs text-muted-foreground">{fallback(form.jobTitle, "Role")}</p>
            <p className="mt-1 truncate text-[11px] text-muted-foreground">{form.department}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AdminProfileChecklist({ form }: { form: AdminProfileForm }) {
  const items = [
    { label: "Display name", done: form.displayName.trim().length > 0 },
    { label: "Department & employee ID", done: form.department.trim() && form.employeeId.trim() },
    { label: "Slack handle", done: form.slackHandle.trim().length > 0 },
    { label: "Bio for handoffs", done: form.bio.trim().length > 24 },
  ]
  const doneCount = items.filter((i) => i.done).length

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-sm">Profile strength</CardTitle>
        <CardDescription className="text-xs">
          {doneCount}/{items.length} checklist items
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 py-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <CheckCircle2
              className={cn("size-4 shrink-0", item.done ? "text-emerald-600" : "text-muted-foreground/40")}
            />
            <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function AdminBasicSection({
  form,
  updateField,
  onSave,
  hasUnsavedChanges,
}: {
  form: AdminProfileForm
  updateField: <K extends keyof AdminProfileForm>(key: K, value: AdminProfileForm[K]) => void
  onSave: () => void
  hasUnsavedChanges: boolean
}) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Contact & locale</CardTitle>
        <CardDescription>Shown on internal systems and escalation pages (demo only).</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 py-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Display name</label>
          <Input value={form.displayName} onChange={(e) => updateField("displayName", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Job title</label>
          <Input value={form.jobTitle} onChange={(e) => updateField("jobTitle", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Work email</label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Phone</label>
          <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Timezone</label>
          <Select value={form.timezone} onValueChange={(v) => updateField("timezone", v ?? "")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Los_Angeles (GMT-7)">America/Los_Angeles (GMT-7)</SelectItem>
              <SelectItem value="America/New_York (GMT-4)">America/New_York (GMT-4)</SelectItem>
              <SelectItem value="Europe/London (GMT+1)">Europe/London (GMT+1)</SelectItem>
              <SelectItem value="Asia/Kolkata (GMT+5:30)">Asia/Kolkata (GMT+5:30)</SelectItem>
              <SelectItem value="Etc/UTC (GMT+0)">Etc/UTC (GMT+0)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Language</label>
          <Select value={form.language} onValueChange={(v) => updateField("language", v ?? "")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
              <SelectItem value="Japanese">Japanese</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Bio</label>
          <Textarea
            className="mt-1.5 min-h-[100px]"
            value={form.bio}
            onChange={(e) => updateField("bio", e.target.value)}
          />
        </div>
      </CardContent>
      <CardContent className="flex justify-end border-t py-3">
        <Button onClick={onSave} disabled={!hasUnsavedChanges}>
          <Save className="size-4" />
          Save changes
        </Button>
      </CardContent>
    </Card>
  )
}

function AdminProfessionalSection({
  form,
  updateField,
}: {
  form: AdminProfileForm
  updateField: <K extends keyof AdminProfileForm>(key: K, value: AdminProfileForm[K]) => void
}) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Organization & access</CardTitle>
        <CardDescription>Department routing and escalation (illustrative).</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 py-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Department</label>
          <Input value={form.department} onChange={(e) => updateField("department", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Employee ID</label>
          <Input value={form.employeeId} onChange={(e) => updateField("employeeId", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Slack</label>
          <Input
            value={form.slackHandle}
            onChange={(e) => updateField("slackHandle", e.target.value)}
            placeholder="@handle"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Escalation role</label>
          <Select
            value={form.escalationRole}
            onValueChange={(v) => updateField("escalationRole", v as AdminProfileForm["escalationRole"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="l1">L1 responder</SelectItem>
              <SelectItem value="l2">L2 responder</SelectItem>
              <SelectItem value="oncall">On-call</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

function AdminPreferencesSection({
  form,
  updateField,
}: {
  form: AdminProfileForm
  updateField: <K extends keyof AdminProfileForm>(key: K, value: AdminProfileForm[K]) => void
}) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Admin notifications</CardTitle>
        <CardDescription>What you receive outside of personal creator alerts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-6">
        <ToggleRow
          label="Incident & SEV pages"
          description="Pager-style pushes for platform incidents."
          value={form.notifyIncidents}
          onChange={(v) => updateField("notifyIncidents", v)}
        />
        <ToggleRow
          label="Weekly ops digest"
          description="Summary of queues, disputes, and payouts."
          value={form.notifyDigest}
          onChange={(v) => updateField("notifyDigest", v)}
        />
        <ToggleRow
          label="Product & changelog"
          description="Feature flags and admin UI changes."
          value={form.notifyProductUpdates}
          onChange={(v) => updateField("notifyProductUpdates", v)}
        />
      </CardContent>
    </Card>
  )
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/70 p-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-border transition-colors",
          value ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "inline-block size-4 translate-x-0.5 rounded-full bg-background shadow-sm transition-transform",
            value && "translate-x-4"
          )}
        />
      </button>
    </div>
  )
}
