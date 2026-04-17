"use client"

import { useState } from "react"
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe2,
  Image as ImageLucide,
  Images,
  Languages,
  Link as LinkIcon,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UserRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  computeCompletion,
  defaultProfileForm,
  type ContentPreference,
  type CreatorProfileForm,
  type PortfolioItem,
  type PortfolioType,
  type ProfileVisibility,
} from "@/features/creator/profile/profile-data"
import { SectionTabs, type SectionTabItem } from "@/features/creator/shared/section-tabs"
import { cn } from "@/lib/utils"

type ProfileTab = "basic" | "professional" | "portfolio" | "policies" | "links"

const profileTabs: SectionTabItem<ProfileTab>[] = [
  { value: "basic", label: "Basic info", icon: UserRound },
  { value: "professional", label: "Professional", icon: BadgeCheck },
  { value: "portfolio", label: "Portfolio", icon: Images },
  { value: "policies", label: "Policies", icon: ShieldCheck },
  { value: "links", label: "Links & visibility", icon: LinkIcon },
]

function initialsFromName(name: string) {
  const trimmed = name.trim()
  if (trimmed.length === 0) return "NC"
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

export function CreatorProfileView() {
  const [form, setForm] = useState<CreatorProfileForm>(defaultProfileForm)
  const [saved, setSaved] = useState(JSON.stringify(defaultProfileForm))
  const [lastSavedAt, setLastSavedAt] = useState("Today, 5:45 PM")
  const [tab, setTab] = useState<ProfileTab>("basic")
  const [skillInput, setSkillInput] = useState("")
  const [languageInput, setLanguageInput] = useState("")

  const completion = computeCompletion(form)
  const hasUnsavedChanges = JSON.stringify(form) !== saved

  function updateField<Key extends keyof CreatorProfileForm>(
    key: Key,
    value: CreatorProfileForm[Key]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function saveProfile() {
    setSaved(JSON.stringify(form))
    setLastSavedAt(new Date().toLocaleString())
  }

  function addSkill() {
    const next = skillInput.trim()
    if (!next || form.skills.includes(next)) return
    updateField("skills", [...form.skills, next])
    setSkillInput("")
  }

  function addLanguage() {
    const next = languageInput.trim()
    if (!next || form.languages.includes(next)) return
    updateField("languages", [...form.languages, next])
    setLanguageInput("")
  }

  return (
    <div className="flex flex-col gap-6">
      <ProfileHero
        form={form}
        completionPercent={completion.percent}
        hasUnsavedChanges={hasUnsavedChanges}
        lastSavedAt={lastSavedAt}
        onSave={saveProfile}
      />

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4 xl:sticky xl:top-6 xl:h-max">
          <ProfilePreviewCard form={form} completionPercent={completion.percent} />
          <CompletionChecklist form={form} />
        </div>

        <div className="space-y-4">
          <SectionTabs value={tab} onChange={setTab} items={profileTabs} />

          {tab === "basic" ? (
            <BasicInfoSection form={form} updateField={updateField} onSave={saveProfile} hasUnsavedChanges={hasUnsavedChanges} />
          ) : null}

          {tab === "professional" ? (
            <ProfessionalSection
              form={form}
              updateField={updateField}
              skillInput={skillInput}
              setSkillInput={setSkillInput}
              languageInput={languageInput}
              setLanguageInput={setLanguageInput}
              onAddSkill={addSkill}
              onAddLanguage={addLanguage}
            />
          ) : null}

          {tab === "portfolio" ? (
            <PortfolioSection form={form} updateField={updateField} />
          ) : null}

          {tab === "policies" ? (
            <PoliciesSection form={form} updateField={updateField} onSave={saveProfile} hasUnsavedChanges={hasUnsavedChanges} />
          ) : null}

          {tab === "links" ? (
            <LinksSection form={form} updateField={updateField} />
          ) : null}
        </div>
      </section>
    </div>
  )
}

function ProfileHero({
  form,
  completionPercent,
  hasUnsavedChanges,
  lastSavedAt,
  onSave,
}: {
  form: CreatorProfileForm
  completionPercent: number
  hasUnsavedChanges: boolean
  lastSavedAt: string
  onSave: () => void
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative">
        {form.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.bannerUrl}
            alt={`${form.displayName} banner`}
            className="h-44 w-full object-cover sm:h-56"
          />
        ) : (
          <div className="relative flex h-44 w-full items-center justify-center bg-linear-to-br from-primary/25 via-accent/40 to-primary/10 sm:h-56">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageLucide className="size-4" />
              Add a banner image for a more professional look
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background/60 via-background/0 to-background/0" />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="absolute top-4 right-4 gap-1.5 bg-background/80 backdrop-blur-sm"
        >
          <Camera className="size-3.5" />
          Change banner
        </Button>
      </div>

      <div className="-mt-12 flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:gap-6 sm:px-6 sm:pb-6">
        <div className="relative">
          {form.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.avatarUrl}
              alt={form.displayName}
              className="size-24 rounded-full border-4 border-card bg-muted object-cover shadow-md sm:size-28"
            />
          ) : (
            <span className="inline-flex size-24 items-center justify-center rounded-full border-4 border-card bg-primary/15 text-xl font-semibold text-primary shadow-md sm:size-28">
              {initialsFromName(form.displayName)}
            </span>
          )}
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            aria-label="Change avatar"
            className="absolute right-0 bottom-1 rounded-full bg-background shadow"
          >
            <Pencil className="size-3.5" />
          </Button>
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className={cn(
                  "text-2xl font-semibold tracking-tight sm:text-3xl",
                  form.displayName.trim() ? "text-foreground" : "text-muted-foreground/80"
                )}
              >
                {fallback(form.displayName, "Your creator name")}
              </h2>
              <Badge variant="secondary" className="gap-1 bg-primary/15 text-primary">
                <CheckCircle2 className="size-3" />
                Creator profile
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {fallback(form.handle, "@your-handle")}
            </p>
            <p className="max-w-2xl text-sm text-foreground/80">
              {fallback(form.tagline, "Add a short tagline that describes what you offer.")}
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs">
              <Badge variant="secondary" className="bg-primary/15 text-primary">
                {completionPercent}% complete
              </Badge>
              <span
                className={cn(
                  hasUnsavedChanges
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-muted-foreground"
                )}
              >
                {hasUnsavedChanges ? "Unsaved changes" : `Saved · ${lastSavedAt}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <ExternalLink className="size-4" />
              Preview public
            </Button>
            <Button onClick={onSave} disabled={!hasUnsavedChanges}>
              <Save className="size-4" />
              Save profile
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProfilePreviewCard({
  form,
  completionPercent,
}: {
  form: CreatorProfileForm
  completionPercent: number
}) {
  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">How buyers see you</CardTitle>
            <CardDescription className="text-xs">Live preview of your storefront card.</CardDescription>
          </div>
          <Badge variant="outline" className="h-5 text-[10px]">Preview</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 py-4">
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
          {form.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.bannerUrl}
              alt=""
              className="h-20 w-full object-cover"
            />
          ) : (
            <div className="h-20 w-full bg-linear-to-br from-primary/25 via-accent/30 to-primary/10" />
          )}
          <div className="relative -mt-8 px-4 pb-4">
            {form.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.avatarUrl}
                alt={form.displayName}
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
              {fallback(form.displayName, "Your creator name")}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {fallback(form.handle, "@your-handle")}
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {fallback(form.tagline, "Add a short tagline that describes what you offer.")}
            </p>

            <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                New
              </span>
              <span>·</span>
              <span>No reviews yet</span>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {form.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="outline" className="h-5 text-[10px]">
                  {skill}
                </Badge>
              ))}
              {form.skills.length > 3 ? (
                <Badge variant="outline" className="h-5 text-[10px]">
                  +{form.skills.length - 3}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Profile completion
          </p>
          <div className="mt-2 h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <p className="mt-1">{completionPercent}% ready for marketplace</p>
        </div>
      </CardContent>
    </Card>
  )
}

function CompletionChecklist({ form }: { form: CreatorProfileForm }) {
  const checks = [
    { label: "Display name", done: form.displayName.trim().length > 0 },
    { label: "Tagline", done: form.tagline.trim().length > 10 },
    { label: "Short bio", done: form.shortBio.trim().length > 20 },
    { label: "Avatar image", done: Boolean(form.avatarUrl) },
    { label: "Banner image", done: Boolean(form.bannerUrl) },
    { label: "3+ skills", done: form.skills.length >= 3 },
    { label: "Language", done: form.languages.length >= 1 },
    { label: "3+ portfolio items", done: form.portfolio.length >= 3 },
    { label: "Social link", done: form.socialLinks.length >= 1 },
    { label: "Policies written", done: form.revisionPolicy.trim().length > 20 },
  ]

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-sm">Next steps</CardTitle>
        <CardDescription className="text-xs">Finish these to increase trust.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1.5 py-4 text-xs">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2">
            {check.done ? (
              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-300" />
            ) : (
              <span className="inline-block size-3.5 rounded-full border border-border" />
            )}
            <span
              className={cn(
                check.done ? "text-muted-foreground line-through" : "text-foreground"
              )}
            >
              {check.label}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function BasicInfoSection({
  form,
  updateField,
  onSave,
  hasUnsavedChanges,
}: {
  form: CreatorProfileForm
  updateField: <Key extends keyof CreatorProfileForm>(key: Key, value: CreatorProfileForm[Key]) => void
  onSave: () => void
  hasUnsavedChanges: boolean
}) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Public identity</CardTitle>
        <CardDescription>Buyer-visible info across profile and service cards.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 py-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Display name</label>
          <Input
            value={form.displayName}
            onChange={(event) => updateField("displayName", event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Handle</label>
          <Input
            value={form.handle}
            onChange={(event) => updateField("handle", event.target.value)}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Tagline</label>
          <Input
            value={form.tagline}
            onChange={(event) => updateField("tagline", event.target.value)}
          />
          <p className="text-[11px] text-muted-foreground">
            Short one-line description. Shown on your storefront card.
          </p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Avatar URL</label>
          <Input
            value={form.avatarUrl}
            onChange={(event) => updateField("avatarUrl", event.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Banner URL</label>
          <Input
            value={form.bannerUrl}
            onChange={(event) => updateField("bannerUrl", event.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Short bio</label>
          <Textarea
            value={form.shortBio}
            onChange={(event) => updateField("shortBio", event.target.value)}
            className="min-h-20"
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">About (detailed)</label>
          <Textarea
            value={form.longBio}
            onChange={(event) => updateField("longBio", event.target.value)}
            className="min-h-28"
          />
        </div>
      </CardContent>
      <CardContent className="flex items-center justify-end border-t py-3">
        <Button onClick={onSave} disabled={!hasUnsavedChanges}>
          <Save className="size-4" />
          Save basic info
        </Button>
      </CardContent>
    </Card>
  )
}

function ProfessionalSection({
  form,
  updateField,
  skillInput,
  setSkillInput,
  languageInput,
  setLanguageInput,
  onAddSkill,
  onAddLanguage,
}: {
  form: CreatorProfileForm
  updateField: <Key extends keyof CreatorProfileForm>(key: Key, value: CreatorProfileForm[Key]) => void
  skillInput: string
  setSkillInput: (value: string) => void
  languageInput: string
  setLanguageInput: (value: string) => void
  onAddSkill: () => void
  onAddLanguage: () => void
}) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Professional details</CardTitle>
        <CardDescription>Skills, languages, and preferences shown to buyers.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 py-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Timezone</label>
          <Input
            value={form.timezone}
            onChange={(event) => updateField("timezone", event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Response time</label>
          <Input
            value={form.responseTime}
            onChange={(event) => updateField("responseTime", event.target.value)}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Niche focus</label>
          <Input
            value={form.niche}
            onChange={(event) => updateField("niche", event.target.value)}
            placeholder="Roleplay, Visual Novel, VTuber..."
          />
        </div>

        <div className="space-y-2 rounded-lg border border-border/70 p-3 md:col-span-2">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Skills
          </p>
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(event) => setSkillInput(event.target.value)}
              placeholder="Add skill"
            />
            <Button type="button" variant="outline" onClick={onAddSkill}>
              <Plus className="size-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form.skills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() =>
                  updateField("skills", form.skills.filter((item) => item !== skill))
                }
                className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted"
              >
                {skill} ×
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-border/70 p-3 md:col-span-2">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Languages className="size-3.5 text-primary" />
            Languages
          </p>
          <div className="flex gap-2">
            <Input
              value={languageInput}
              onChange={(event) => setLanguageInput(event.target.value)}
              placeholder="Add language"
            />
            <Button type="button" variant="outline" onClick={onAddLanguage}>
              <Plus className="size-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form.languages.map((language) => (
              <button
                key={language}
                type="button"
                onClick={() =>
                  updateField("languages", form.languages.filter((item) => item !== language))
                }
                className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted"
              >
                {language} ×
              </button>
            ))}
          </div>
        </div>
      </CardContent>

      <CardContent className="grid gap-4 border-t py-4 md:grid-cols-3">
        <MetricTile label="Response rate" value={`${form.responseRate}%`} />
        <MetricTile label="On-time delivery" value={`${form.onTimeDelivery}%`} />
        <MetricTile label="Repeat buyer rate" value={`${form.repeatBuyerRate}%`} />
      </CardContent>
    </Card>
  )
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

function PortfolioSection({
  form,
  updateField,
}: {
  form: CreatorProfileForm
  updateField: <Key extends keyof CreatorProfileForm>(key: Key, value: CreatorProfileForm[Key]) => void
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between border-b pb-4">
        <div>
          <CardTitle>Portfolio highlights</CardTitle>
          <CardDescription>Showcase your strongest recent work.</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            updateField("portfolio", [
              ...form.portfolio,
              {
                id: `port-${crypto.randomUUID()}`,
                title: "",
                type: "character",
                imageUrl: "",
                summary: "",
              },
            ])
          }
        >
          <Plus className="size-3.5" />
          Add item
        </Button>
      </CardHeader>
      <CardContent className="py-4">
        {form.portfolio.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            Add portfolio items to showcase your work for buyers.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {form.portfolio.map((item) => (
              <PortfolioItemEditor
                key={item.id}
                item={item}
                onChange={(updated) =>
                  updateField(
                    "portfolio",
                    form.portfolio.map((port) => (port.id === item.id ? updated : port))
                  )
                }
                onRemove={() =>
                  updateField(
                    "portfolio",
                    form.portfolio.filter((port) => port.id !== item.id)
                  )
                }
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PortfolioItemEditor({
  item,
  onChange,
  onRemove,
}: {
  item: PortfolioItem
  onChange: (updated: PortfolioItem) => void
  onRemove: () => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="relative aspect-video bg-muted">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.title || "Portfolio item"} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            <ImageLucide className="mr-1.5 size-4" />
            Preview image
          </div>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label="Remove portfolio item"
          className="absolute top-2 right-2 bg-background/80 hover:bg-background"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
      <div className="space-y-2 p-3">
        <Input
          value={item.title}
          onChange={(event) => onChange({ ...item, title: event.target.value })}
          placeholder="Portfolio title"
        />
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={item.type}
            onValueChange={(value) => onChange({ ...item, type: value as PortfolioType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="character">Character</SelectItem>
              <SelectItem value="persona">Persona</SelectItem>
              <SelectItem value="lorebook">Lorebook</SelectItem>
              <SelectItem value="avatar">Avatar</SelectItem>
              <SelectItem value="background">Background</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={item.imageUrl}
            onChange={(event) => onChange({ ...item, imageUrl: event.target.value })}
            placeholder="Image URL"
          />
        </div>
        <Textarea
          value={item.summary}
          onChange={(event) => onChange({ ...item, summary: event.target.value })}
          placeholder="Short portfolio context"
          className="min-h-16"
        />
      </div>
    </div>
  )
}

function PoliciesSection({
  form,
  updateField,
  onSave,
  hasUnsavedChanges,
}: {
  form: CreatorProfileForm
  updateField: <Key extends keyof CreatorProfileForm>(key: Key, value: CreatorProfileForm[Key]) => void
  onSave: () => void
  hasUnsavedChanges: boolean
}) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Buyer policies</CardTitle>
        <CardDescription>Clear expectations reduce friction and revision churn.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 py-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Buyer requirements</label>
          <Textarea
            value={form.buyerRequirements}
            onChange={(event) => updateField("buyerRequirements", event.target.value)}
            className="min-h-24"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Revision policy</label>
          <Textarea
            value={form.revisionPolicy}
            onChange={(event) => updateField("revisionPolicy", event.target.value)}
            className="min-h-24"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Refund policy</label>
          <Textarea
            value={form.refundPolicy}
            onChange={(event) => updateField("refundPolicy", event.target.value)}
            className="min-h-24"
          />
        </div>
      </CardContent>
      <CardContent className="flex items-center justify-end border-t py-3">
        <Button onClick={onSave} disabled={!hasUnsavedChanges}>
          <FileText className="size-4" />
          Save policies
        </Button>
      </CardContent>
    </Card>
  )
}

function LinksSection({
  form,
  updateField,
}: {
  form: CreatorProfileForm
  updateField: <Key extends keyof CreatorProfileForm>(key: Key, value: CreatorProfileForm[Key]) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between border-b pb-4">
          <div>
            <CardTitle>Social links</CardTitle>
            <CardDescription>External presence that builds buyer trust.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateField("socialLinks", [
                ...form.socialLinks,
                { id: `social-${crypto.randomUUID()}`, platform: "", url: "" },
              ])
            }
          >
            <Plus className="size-3.5" />
            Add link
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 py-4">
          {form.socialLinks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              Add external profiles to help buyers discover you.
            </div>
          ) : (
            form.socialLinks.map((link) => (
              <div
                key={link.id}
                className="grid gap-2 rounded-lg border border-border/70 p-3 md:grid-cols-[160px_1fr_auto]"
              >
                <Input
                  value={link.platform}
                  onChange={(event) =>
                    updateField(
                      "socialLinks",
                      form.socialLinks.map((item) =>
                        item.id === link.id ? { ...item, platform: event.target.value } : item
                      )
                    )
                  }
                  placeholder="Platform"
                />
                <Input
                  value={link.url}
                  onChange={(event) =>
                    updateField(
                      "socialLinks",
                      form.socialLinks.map((item) =>
                        item.id === link.id ? { ...item, url: event.target.value } : item
                      )
                    )
                  }
                  placeholder="https://..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    updateField(
                      "socialLinks",
                      form.socialLinks.filter((item) => item.id !== link.id)
                    )
                  }
                  aria-label="Remove link"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle>Visibility & content preference</CardTitle>
          <CardDescription>Controls what buyers see on your storefront.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 py-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Profile visibility</label>
            <Select
              value={form.profileVisibility}
              onValueChange={(value) =>
                updateField("profileVisibility", value as ProfileVisibility)
              }
            >
              <SelectTrigger>
                <Globe2 className="size-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Content preference</label>
            <Select
              value={form.contentPreference}
              onValueChange={(value) =>
                updateField("contentPreference", value as ContentPreference)
              }
            >
              <SelectTrigger>
                <Sparkles className="size-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SFW">SFW only</SelectItem>
                <SelectItem value="NSFW">NSFW only</SelectItem>
                <SelectItem value="Both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
