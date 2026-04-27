"use client"

import Link from "next/link"
import { type ChangeEvent, type KeyboardEvent, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, Eye, ImagePlus, UserRound } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { SectionTabs, type SectionTabItem } from "@/features/creator/shared/section-tabs"
import {
  formatPersonaUsageCount,
  PersonaSafety,
  PersonaVisibility,
} from "@/features/creator/workspace/personas/personas-data"
import { cn } from "@/lib/utils"

type PersonaCreateTab = "basic" | "meta"

type PersonaFormValues = {
  personaName: string
  personaDetails: string
  avatarUrl: string
  tags: string[]
  safety: PersonaSafety
  visibility: PersonaVisibility
}

type PersonaFieldErrorKey = "personaName" | "personaDetails" | "avatarUrl" | "tags"

const personaCreateTabs: SectionTabItem<PersonaCreateTab>[] = [
  { value: "basic", label: "Basic info", icon: UserRound },
  // { value: "meta", label: "Visibility & safety", icon: Eye },
]

const defaultFormValues: PersonaFormValues = {
  personaName: "",
  personaDetails: "",
  avatarUrl: "",
  tags: [],
  safety: "SFW",
  visibility: "private",
}

function initialsFromName(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return "PR"
  return trimmed
    .split(/\s+/)
    .map((part) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function PersonaCreateFormView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")?.trim() ?? ""
  const isEditMode = Boolean(editId)
  const [formValues, setFormValues] = useState<PersonaFormValues>(defaultFormValues)
  const [tagInput, setTagInput] = useState("")
  const [tab, setTab] = useState<PersonaCreateTab>("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingEditPersona, setIsLoadingEditPersona] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<PersonaFieldErrorKey, string>>>({})

  function updateField<Key extends keyof PersonaFormValues>(key: Key, value: PersonaFormValues[Key]) {
    setFormValues((current) => ({ ...current, [key]: value }))
    if (key in fieldErrors) {
      setFieldErrors((current) => ({ ...current, [key]: undefined }))
    }
  }

  function addTag() {
    const parts = tagInput
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value.length > 0)

    if (parts.length === 0) return

    const existing = new Set(formValues.tags.map((tag) => tag.toLowerCase()))
    const nextTags = [...formValues.tags]

    for (const part of parts) {
      const normalized = part.toLowerCase()
      if (existing.has(normalized)) continue
      nextTags.push(part)
      existing.add(normalized)
    }

    if (nextTags.length === formValues.tags.length) {
      setTagInput("")
      return
    }

    updateField("tags", nextTags)
    setTagInput("")
  }

  function onTagInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      addTag()
    }
  }

  function removeTag(tag: string) {
    updateField(
      "tags",
      formValues.tags.filter((value) => value !== tag)
    )
  }

  function resetForm() {
    setFormValues(defaultFormValues)
    setTagInput("")
    setFieldErrors({})
  }

  async function uploadAvatar(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("kind", "avatar")

    const response = await fetch("/api/profile/upload", {
      method: "POST",
      body: formData,
    })
    const payload = (await response.json()) as { error?: string; url?: string }
    if (!response.ok || !payload.url) {
      throw new Error(payload.error ?? "Upload failed")
    }
    return payload.url
  }

  async function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingAvatar(true)
    try {
      const url = await uploadAvatar(file)
      updateField("avatarUrl", url)
      setFieldErrors((current) => ({ ...current, avatarUrl: undefined }))
      toast.success("Avatar uploaded")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Avatar upload failed."
      toast.error("Avatar upload failed", { description: message })
    } finally {
      setIsUploadingAvatar(false)
      event.target.value = ""
    }
  }

  useEffect(() => {
    let mounted = true
    if (!editId) return

    async function loadPersonaForEdit() {
      setIsLoadingEditPersona(true)
      try {
        const response = await fetch(`/api/creator/personas?id=${editId}`)
        const payload = (await response.json()) as {
          item?: Partial<PersonaFormValues> | null
          error?: string
          details?: string
        }
        if (!response.ok || !payload.item) {
          toast.error("Unable to load persona details", {
            description: payload.details ?? payload.error ?? "Please try again.",
          })
          return
        }
        if (!mounted) return
        setFormValues({
          personaName: payload.item.personaName ?? "",
          personaDetails: payload.item.personaDetails ?? "",
          avatarUrl: payload.item.avatarUrl ?? "",
          tags: Array.isArray(payload.item.tags) ? payload.item.tags : [],
          safety: (payload.item.safety as PersonaSafety) ?? "SFW",
          visibility: (payload.item.visibility as PersonaVisibility) ?? "private",
        })
      } catch {
        toast.error("Unable to load persona details")
      } finally {
        if (mounted) setIsLoadingEditPersona(false)
      }
    }

    void loadPersonaForEdit()
    return () => {
      mounted = false
    }
  }, [editId])

  function validateForm(values: PersonaFormValues) {
    const errors: Partial<Record<PersonaFieldErrorKey, string>> = {}
    if (!values.personaName.trim()) errors.personaName = "Persona name is required."
    if (!values.personaDetails.trim()) errors.personaDetails = "Persona details are required."
    if (!values.avatarUrl.trim()) errors.avatarUrl = "Avatar is required."
    if (!values.tags.length) errors.tags = "At least one tag is required."
    return errors
  }

  function tabForField(field: PersonaFieldErrorKey): PersonaCreateTab {
    return field === "personaName" || field === "personaDetails" || field === "avatarUrl" || field === "tags"
      ? "basic"
      : "meta"
  }

  async function submitPersona() {
    if (isSubmitting) return
    const validationErrors = validateForm(formValues)
    const missingFields = Object.keys(validationErrors) as PersonaFieldErrorKey[]
    if (missingFields.length > 0) {
      setFieldErrors(validationErrors)
      setTab(tabForField(missingFields[0]))
      toast.warning("Please fill all required fields", {
        description: `${missingFields.length} field(s) still missing.`,
      })
      return
    }
    setFieldErrors({})

    setIsSubmitting(true)
    try {
      const endpoint = isEditMode ? `/api/creator/personas?id=${editId}` : "/api/creator/personas"
      const response = await fetch(endpoint, {
        method: isEditMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      })
      const payload = (await response.json()) as { error?: string; details?: string }
      if (!response.ok) {
        toast.error(isEditMode ? "Unable to update persona" : "Unable to create persona", {
          description: payload.details ?? payload.error ?? "Please try again.",
        })
        return
      }
      toast.success(isEditMode ? "Persona updated successfully" : "Persona created successfully")
      resetForm()
      router.push("/dashboard/creator/workspace/personas")
      router.refresh()
    } catch {
      toast.error(isEditMode ? "Unable to update persona" : "Unable to create persona")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-card">
        <div className="relative h-40 overflow-hidden rounded-t-2xl bg-linear-to-br from-primary/20 via-accent/30 to-background sm:h-52">
          <Link
            href="/dashboard/creator/workspace/personas"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "absolute left-2 top-2 z-20 h-7 w-fit px-2 text-muted-foreground"
            )}
          >
            <ArrowLeft className="size-3.5" />
            Back to Personas
          </Link>
        </div>
        <div className="flex flex-col gap-4 px-4 pb-4 pt-2 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:pb-6 sm:pt-3">
          <div className="flex min-w-0 gap-3 sm:gap-4">
            <div className="relative z-10 -mt-12 shrink-0 self-start">
              <div
                className={cn(
                  "flex size-24 items-center justify-center overflow-hidden rounded-full border-4 bg-muted shadow-md ring-2 sm:size-28",
                  fieldErrors.avatarUrl ? "border-destructive/70 ring-destructive/20" : "border-card ring-background"
                )}
              >
                {formValues.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formValues.avatarUrl}
                    alt={formValues.personaName || "Persona avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-semibold text-primary">
                    {initialsFromName(formValues.personaName)}
                  </span>
                )}
              </div>
              <label className="absolute bottom-1 right-1 inline-flex cursor-pointer items-center justify-center rounded-full border border-border bg-background p-1.5 shadow-sm ring-2 ring-background">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                  className="hidden"
                />
                <ImagePlus className="size-3.5 text-muted-foreground" />
              </label>
            </div>

            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="max-w-[170px] truncate text-xl font-semibold tracking-tight sm:max-w-none sm:text-3xl">
                  {formValues.personaName.trim() || "Persona name"}
                </h2>
                <Badge variant="secondary" className="gap-1 bg-primary/15 text-primary">
                  <CheckCircle2 className="size-3" />
                  Persona draft
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formValues.personaDetails.trim() || "Your persona details preview will appear here."}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="h-5 text-[10px] capitalize">
                  {formValues.visibility}
                </Badge>
                <Badge
                  variant="secondary"
                  className={cn(
                    "h-5 text-[10px]",
                    formValues.safety === "NSFW"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-primary/15 text-primary"
                  )}
                >
                  {formValues.safety}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
            <Button type="button" variant="ghost" onClick={resetForm} className="flex-1 sm:flex-none">
              Reset
            </Button>
            <Button
              type="button"
              onClick={submitPersona}
              disabled={isSubmitting || isLoadingEditPersona || isUploadingAvatar}
              className="flex-1 sm:flex-none"
            >
              {isLoadingEditPersona
                ? "Loading..."
                : isSubmitting
                  ? isEditMode
                    ? "Saving..."
                    : "Creating..."
                  : isEditMode
                    ? "Edit Persona"
                    : "Create Persona"}
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <Card className="xl:sticky xl:top-6 xl:h-max">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">How buyers see this</CardTitle>
                <CardDescription className="text-xs">Live preview of the persona card.</CardDescription>
              </div>
              <Badge variant="outline" className="h-5 text-[10px]">
                Preview
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 py-4">
            <div className="overflow-hidden rounded-xl border border-border/70 bg-card p-3">
              <div className="flex items-start gap-3">
                <div className="inline-flex size-14 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  {formValues.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formValues.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-primary">
                      {initialsFromName(formValues.personaName)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {formValues.personaName.trim() || "Persona name"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {formValues.personaDetails.trim() || "No details yet."}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {formValues.tags.slice(0, 5).map((tag) => (
                  <Badge key={tag} variant="secondary" className="h-5 text-[10px] text-primary/80">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Eye className="size-3" />
                  {formatPersonaUsageCount(0)}
                </span>
                <span>{isEditMode ? "saved" : "draft"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <SectionTabs value={tab} onChange={setTab} items={personaCreateTabs} />

          {tab === "basic" ? (
            <Card>
              <CardHeader className="border-b pb-4">
                <CardTitle>Basic info</CardTitle>
                <CardDescription>Core persona details buyers see first.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 py-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Persona Name</label>
                  <Input
                    value={formValues.personaName}
                    onChange={(event) => updateField("personaName", event.target.value)}
                    placeholder="Enter persona name"
                    aria-invalid={fieldErrors.personaName ? "true" : "false"}
                    className={cn(fieldErrors.personaName ? "border-destructive focus-visible:ring-destructive/40" : "")}
                  />
                  {fieldErrors.personaName ? (
                    <p className="text-xs font-medium text-destructive">{fieldErrors.personaName}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Persona Details</label>
                  <Textarea
                    value={formValues.personaDetails}
                    onChange={(event) => updateField("personaDetails", event.target.value)}
                    placeholder="Describe tone, behavior style, and speaking pattern..."
                    className={cn(
                      "min-h-24",
                      fieldErrors.personaDetails ? "border-destructive focus-visible:ring-destructive/40" : ""
                    )}
                    aria-invalid={fieldErrors.personaDetails ? "true" : "false"}
                  />
                  {fieldErrors.personaDetails ? (
                    <p className="text-xs font-medium text-destructive">{fieldErrors.personaDetails}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tags</label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(event) => setTagInput(event.target.value)}
                      onKeyDown={onTagInputKeyDown}
                      placeholder="Add tag and press add"
                      aria-invalid={fieldErrors.tags ? "true" : "false"}
                      className={cn(fieldErrors.tags ? "border-destructive focus-visible:ring-destructive/40" : "")}
                    />
                    <Button type="button" variant="outline" className="h-10 px-4" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {formValues.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        render={
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            aria-label={`Remove ${tag} tag`}
                          />
                        }
                        className="h-8 cursor-pointer rounded-full px-3 text-xs text-primary/80 hover:bg-muted"
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                  {fieldErrors.tags ? <p className="text-xs font-medium text-destructive">{fieldErrors.tags}</p> : null}
                </div>
              </CardContent>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Visibility</label>
                  <Select
                    value={formValues.visibility}
                    onValueChange={(value) => updateField("visibility", value as PersonaVisibility)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="unlisted">Unlisted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Safety</label>
                  <Select
                    value={formValues.safety}
                    onValueChange={(value) => updateField("safety", value as PersonaSafety)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SFW">SFW</SelectItem>
                      <SelectItem value="NSFW">NSFW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ) : null}

        </div>
      </section>
    </div>
  )
}
