"use client"

import Link from "next/link"
import { type ChangeEvent, type KeyboardEvent, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, Eye, FileText, Image as ImageIcon, ImagePlus, UserRound } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { SectionTabs, type SectionTabItem } from "@/features/creator/shared/section-tabs"
import {
  CharacterSafety,
  CharacterStatus,
  CharacterVisibility,
} from "@/features/creator/workspace/characters/characters-data"
import { formatUsageCount } from "@/features/creator/workspace/characters/characters-data"
import { cn } from "@/lib/utils"

type CharacterCreateTab = "identity" | "dialogue" | "meta"
type CharacterFieldErrorKey =
  | "characterName"
  | "avatarUrl"
  | "backgroundUrl"
  | "description"
  | "scenario"
  | "personalitySummary"
  | "firstMessage"
  | "alternativeMessages"
  | "exampleDialogue"
  | "authorNotes"
  | "characterNotes"
  | "tags"

type CharacterFormValues = {
  characterName: string
  avatarUrl: string
  backgroundUrl: string
  visibility: CharacterVisibility
  safety: CharacterSafety
  tags: string[]
  description: string
  scenario: string
  personalitySummary: string
  firstMessage: string
  alternativeMessages: string
  exampleDialogue: string
  authorNotes: string
  characterNotes: string
  status: CharacterStatus
}

const characterCreateTabs: SectionTabItem<CharacterCreateTab>[] = [
  { value: "identity", label: "Basic info", icon: ImageIcon },
  { value: "dialogue", label: "Dialogue", icon: FileText },
  { value: "meta", label: "Notes & visibility", icon: Eye },
]

const defaultFormValues: CharacterFormValues = {
  characterName: "",
  avatarUrl: "",
  backgroundUrl: "",
  visibility: "private",
  safety: "SFW",
  tags: [],
  description: "",
  scenario: "",
  personalitySummary: "",
  firstMessage: "",
  alternativeMessages: "",
  exampleDialogue: "",
  authorNotes: "",
  characterNotes: "",
  status: "draft",
}

function initialsFromName(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return "CH"
  return trimmed
    .split(/\s+/)
    .map((part) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function CharacterCreateFormView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")?.trim() ?? ""
  const [formValues, setFormValues] = useState<CharacterFormValues>(defaultFormValues)
  const [tagInput, setTagInput] = useState("")
  const [tab, setTab] = useState<CharacterCreateTab>("identity")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingBackground, setIsUploadingBackground] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<CharacterFieldErrorKey, string>>>({})
  const [isLoadingEditCharacter, setIsLoadingEditCharacter] = useState(false)
  const isEditMode = Boolean(editId)

  function updateField<Key extends keyof CharacterFormValues>(
    key: Key,
    value: CharacterFormValues[Key]
  ) {
    setFormValues((current) => ({ ...current, [key]: value }))
    if (key in fieldErrors) {
      setFieldErrors((current) => ({ ...current, [key]: undefined }))
    }
  }

  function addTag() {
    const next = tagInput.trim()
    if (!next) return
    if (formValues.tags.includes(next)) {
      setTagInput("")
      return
    }
    updateField("tags", [...formValues.tags, next])
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
    if (fieldErrors.tags) {
      setFieldErrors((current) => ({ ...current, tags: undefined }))
    }
  }

  function resetForm() {
    setFormValues(defaultFormValues)
    setTagInput("")
    setFieldErrors({})
  }

  async function uploadImage(file: File, kind: "avatar" | "banner"): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("kind", kind)

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
      const url = await uploadImage(file, "avatar")
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

  async function handleBackgroundUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingBackground(true)
    try {
      const url = await uploadImage(file, "banner")
      updateField("backgroundUrl", url)
      setFieldErrors((current) => ({ ...current, backgroundUrl: undefined }))
      toast.success("Background uploaded")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Background upload failed."
      toast.error("Background upload failed", { description: message })
    } finally {
      setIsUploadingBackground(false)
      event.target.value = ""
    }
  }

  const isMediaUploading = isUploadingAvatar || isUploadingBackground

  useEffect(() => {
    let mounted = true
    if (!editId) return

    async function loadCharacterForEdit() {
      setIsLoadingEditCharacter(true)
      try {
        const response = await fetch(`/api/creator/characters?id=${editId}`)
        const payload = (await response.json()) as {
          item?: Partial<CharacterFormValues> | null
          error?: string
          details?: string
        }
        if (!response.ok || !payload.item) {
          toast.error("Unable to load character details", {
            description: payload.details ?? payload.error ?? "Please try again.",
          })
          return
        }
        if (!mounted) return

        setFormValues({
          characterName: payload.item.characterName ?? "",
          avatarUrl: payload.item.avatarUrl ?? "",
          backgroundUrl: payload.item.backgroundUrl ?? "",
          visibility: (payload.item.visibility as CharacterVisibility) ?? "private",
          safety: (payload.item.safety as CharacterSafety) ?? "SFW",
          tags: Array.isArray(payload.item.tags) ? payload.item.tags : [],
          description: payload.item.description ?? "",
          scenario: payload.item.scenario ?? "",
          personalitySummary: payload.item.personalitySummary ?? "",
          firstMessage: payload.item.firstMessage ?? "",
          alternativeMessages: payload.item.alternativeMessages ?? "",
          exampleDialogue: payload.item.exampleDialogue ?? "",
          authorNotes: payload.item.authorNotes ?? "",
          characterNotes: payload.item.characterNotes ?? "",
          status: (payload.item.status as CharacterStatus) ?? "draft",
        })
      } catch {
        toast.error("Unable to load character details")
      } finally {
        if (mounted) setIsLoadingEditCharacter(false)
      }
    }

    void loadCharacterForEdit()
    return () => {
      mounted = false
    }
  }, [editId])

  function validateForm(values: CharacterFormValues) {
    const errors: Partial<Record<CharacterFieldErrorKey, string>> = {}
    if (!values.characterName.trim()) errors.characterName = "Character name is required."
    if (!values.avatarUrl.trim()) errors.avatarUrl = "Avatar image is required."
    if (!values.backgroundUrl.trim()) errors.backgroundUrl = "Background image is required."
    if (!values.description.trim()) errors.description = "Description is required."
    if (!values.scenario.trim()) errors.scenario = "Scenario is required."
    if (!values.personalitySummary.trim()) errors.personalitySummary = "Personality summary is required."
    if (!values.firstMessage.trim()) errors.firstMessage = "First message is required."
    if (!values.alternativeMessages.trim()) errors.alternativeMessages = "Alternative message is required."
    if (!values.exampleDialogue.trim()) errors.exampleDialogue = "Example dialogue is required."
    if (!values.authorNotes.trim()) errors.authorNotes = "Author notes are required."
    if (!values.characterNotes.trim()) errors.characterNotes = "Character notes are required."
    if (!values.tags.length) errors.tags = "At least one tag is required."
    return errors
  }

  function tabForField(field: CharacterFieldErrorKey): CharacterCreateTab {
    if (
      field === "characterName" ||
      field === "description" ||
      field === "scenario" ||
      field === "personalitySummary"
    ) {
      return "identity"
    }
    if (field === "firstMessage" || field === "alternativeMessages" || field === "exampleDialogue") {
      return "dialogue"
    }
    return "meta"
  }

  async function createCharacter() {
    if (isSubmitting) return
    const validationErrors = validateForm(formValues)
    const missingFields = Object.keys(validationErrors) as CharacterFieldErrorKey[]
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
      const endpoint = isEditMode ? `/api/creator/characters?id=${editId}` : "/api/creator/characters"
      const response = await fetch(endpoint, {
        method: isEditMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      })

      const payload = (await response.json()) as { error?: string; details?: string; hint?: string; id?: string }
      if (!response.ok) {
        toast.error(isEditMode ? "Unable to update character" : "Unable to create character", {
          description: payload.details ?? payload.error ?? payload.hint ?? "Please try again.",
        })
        return
      }

      toast.success(isEditMode ? "Character updated successfully" : "Character created successfully")
      resetForm()
      router.push("/dashboard/creator/workspace/characters")
      router.refresh()
    } catch {
      toast.error(isEditMode ? "Unable to update character" : "Unable to create character", {
        description: "Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6  ">

      <section className="rounded-2xl border border-border bg-card">
        <div className="relative overflow-hidden rounded-t-2xl">
        <Link
          href="/dashboard/creator/workspace/characters"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-7 w-fit px-2 text-muted-foreground absolute top-2 left-2 z-20"
          )}
        >
          <ArrowLeft className="size-3.5" />
          Back to Characters
        </Link>
          {formValues.backgroundUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={formValues.backgroundUrl}
              alt="Character background"
              className="h-44 w-full object-cover sm:h-56"
            />
          ) : (
            <div className="relative flex h-44 w-full items-center justify-center bg-linear-to-br from-primary/25 via-accent/40 to-primary/10 sm:h-56">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="size-4" />
                Add a background image for this character
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/60 via-background/0 to-background/0" />
          <label className="absolute right-4 top-4 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background/85 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
            <ImagePlus className="size-3.5" />
            {isUploadingBackground ? "Uploading..." : "Change background"}
            <Input
              type="file"
              accept="image/*"
              onChange={handleBackgroundUpload}
              disabled={isUploadingBackground}
              className="hidden"
            />
          </label>
          {fieldErrors.backgroundUrl ? (
            <p className="absolute bottom-3 right-4 text-xs font-medium text-destructive">
              {fieldErrors.backgroundUrl}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 px-5 pb-5 pt-2 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:pb-6 sm:pt-3">
          <div className="flex min-w-0 gap-4">
            <div className="relative z-10 -mt-12 shrink-0 self-start">
              {formValues.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formValues.avatarUrl}
                  alt={formValues.characterName || "Character avatar"}
                  className={cn(
                    "size-24 rounded-full border-4 bg-muted object-cover shadow-md ring-2 sm:size-28",
                    fieldErrors.avatarUrl
                      ? "border-destructive/70 ring-destructive/20"
                      : "border-card ring-background"
                  )}
                />
              ) : (
                <span
                  className={cn(
                    "inline-flex size-24 items-center justify-center rounded-full border-4 bg-primary/15 text-xl font-semibold text-primary shadow-md ring-2 sm:size-28",
                    fieldErrors.avatarUrl
                      ? "border-destructive/70 ring-destructive/20"
                      : "border-card ring-background"
                  )}
                >
                  {initialsFromName(formValues.characterName)}
                </span>
              )}
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

            <div className="min-w-0 space-y-1.5 relative">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className={cn(
                    "text-2xl font-semibold tracking-tight sm:text-3xl",
                    formValues.characterName.trim() ? "text-foreground" : "text-muted-foreground/80"
                  )}
                >
                  {formValues.characterName.trim() || "Character name"}
                </h2>
                <Badge variant="secondary" className="gap-1 bg-primary/15 text-primary">
                  <CheckCircle2 className="size-3" />
                  Character draft
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formValues.description.trim() || "Your character tagline/description will appear here."}
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
                {isMediaUploading ? <span>Uploading media...</span> : null}
              </div>
              {/* {fieldErrors.avatarUrl ? (
                <p className="text-xs absolute right-80 whitespace-nowrap font-medium text-destructive">{fieldErrors.avatarUrl}</p>
              ) : null} */}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="ghost" onClick={resetForm}>
              Reset
            </Button>
            <Button
              type="button"
              onClick={createCharacter}
              disabled={isSubmitting || isUploadingAvatar || isUploadingBackground || isLoadingEditCharacter}
            >
              {isLoadingEditCharacter
                ? "Loading..."
                : isSubmitting
                  ? isEditMode
                    ? "Saving..."
                    : "Creating..."
                  : isEditMode
                    ? "Edit Character"
                    : "Create Character"}
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
                <CardDescription className="text-xs">Live preview of the character card.</CardDescription>
              </div>
              <Badge variant="outline" className="h-5 text-[10px]">
                Preview
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 py-4">
            <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
              {formValues.backgroundUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={formValues.backgroundUrl} alt="" className="h-20 w-full object-cover" />
              ) : (
                <div className="h-20 w-full bg-linear-to-br from-primary/25 via-accent/30 to-primary/10" />
              )}
              <div className="relative -mt-8 px-4 pb-4">
                {formValues.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formValues.avatarUrl}
                    alt={formValues.characterName || "Character avatar"}
                    className="size-14 rounded-full border-4 border-card object-cover"
                  />
                ) : (
                  <span className="inline-flex size-14 items-center justify-center rounded-full border-4 border-card bg-primary/15 text-sm font-semibold text-primary">
                    {initialsFromName(formValues.characterName)}
                  </span>
                )}

                <p className="mt-2 truncate text-sm font-semibold">
                  {formValues.characterName.trim() || "Character name"}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {formValues.tags.slice(0, 5).map((tag) => (
                    <Badge key={tag} variant="secondary" className="h-5 text-[10px] text-primary/80">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {formValues.description.trim() || "Character description preview."}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
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
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="size-3" />
                    {formatUsageCount(0)}
                  </span>
                  <span>{formValues.status}</span>
                </div>
                
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <SectionTabs value={tab} onChange={setTab} items={characterCreateTabs} />

          {tab === "identity" ? (
            <Card>
              <CardHeader className="border-b pb-4">
                <CardTitle>Public identity</CardTitle>
                <CardDescription>Core information buyers see first.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 py-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Character Name</label>
                  <Input
                    value={formValues.characterName}
                    onChange={(event) => updateField("characterName", event.target.value)}
                    placeholder="Enter character name"
                    aria-invalid={fieldErrors.characterName ? "true" : "false"}
                    className={cn(fieldErrors.characterName ? "border-destructive focus-visible:ring-destructive/40" : "")}
                  />
                  {fieldErrors.characterName ? (
                    <p className="text-xs font-medium text-destructive">{fieldErrors.characterName}</p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Status</label>
                  <Select
                    value={formValues.status}
                    onValueChange={(value) => updateField("status", value as CharacterStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Description</label>
                  <Textarea
                    value={formValues.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    placeholder="Describe the character in detail..."
                    aria-invalid={fieldErrors.description ? "true" : "false"}
                    className={cn(fieldErrors.description ? "border-destructive focus-visible:ring-destructive/40" : "")}
                  />
                  {fieldErrors.description ? (
                    <p className="text-xs font-medium text-destructive">{fieldErrors.description}</p>
                  ) : null}
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Scenario</label>
                  <Textarea
                    value={formValues.scenario}
                    onChange={(event) => updateField("scenario", event.target.value)}
                    placeholder="Scenario / location / universe"
                    aria-invalid={fieldErrors.scenario ? "true" : "false"}
                    className={cn(fieldErrors.scenario ? "border-destructive focus-visible:ring-destructive/40" : "")}
                  />
                  {fieldErrors.scenario ? (
                    <p className="text-xs font-medium text-destructive">{fieldErrors.scenario}</p>
                  ) : null}
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Personality Summary</label>
                  <Textarea
                    value={formValues.personalitySummary}
                    onChange={(event) => updateField("personalitySummary", event.target.value)}
                    placeholder="Character personality"
                    aria-invalid={fieldErrors.personalitySummary ? "true" : "false"}
                    className={cn(fieldErrors.personalitySummary ? "border-destructive focus-visible:ring-destructive/40" : "")}
                  />
                  {fieldErrors.personalitySummary ? (
                    <p className="text-xs font-medium text-destructive">{fieldErrors.personalitySummary}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {tab === "dialogue" ? (
            <Card>
              <CardHeader className="border-b pb-4">
                <CardTitle>Dialogue setup</CardTitle>
                <CardDescription>Opening lines and dialogue style for consistency.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 py-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">First Message</label>
                  <Textarea
                    value={formValues.firstMessage}
                    onChange={(event) => updateField("firstMessage", event.target.value)}
                    placeholder="Initial in-character message"
                    aria-invalid={fieldErrors.firstMessage ? "true" : "false"}
                    className={cn(fieldErrors.firstMessage ? "border-destructive focus-visible:ring-destructive/40" : "")}
                  />
                  {fieldErrors.firstMessage ? (
                    <p className="text-xs font-medium text-destructive">{fieldErrors.firstMessage}</p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Alternative Message</label>
                  <Textarea
                    value={formValues.alternativeMessages}
                    onChange={(event) => updateField("alternativeMessages", event.target.value)}
                    placeholder="Alternative opening lines"
                    aria-invalid={fieldErrors.alternativeMessages ? "true" : "false"}
                    className={cn(
                      fieldErrors.alternativeMessages ? "border-destructive focus-visible:ring-destructive/40" : ""
                    )}
                  />
                  {fieldErrors.alternativeMessages ? (
                    <p className="text-xs font-medium text-destructive">{fieldErrors.alternativeMessages}</p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Example Dialogue</label>
                  <Textarea
                    value={formValues.exampleDialogue}
                    onChange={(event) => updateField("exampleDialogue", event.target.value)}
                    placeholder="Sample dialogue style"
                    aria-invalid={fieldErrors.exampleDialogue ? "true" : "false"}
                    className={cn(fieldErrors.exampleDialogue ? "border-destructive focus-visible:ring-destructive/40" : "")}
                  />
                  {fieldErrors.exampleDialogue ? (
                    <p className="text-xs font-medium text-destructive">{fieldErrors.exampleDialogue}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {tab === "meta" ? (
            <Card>
              <CardHeader className="border-b pb-4">
                <CardTitle>Visibility, safety, and notes</CardTitle>
                <CardDescription>Internal notes and marketplace controls.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 py-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Visibility</label>
                  <Select
                    value={formValues.visibility}
                    onValueChange={(value) => updateField("visibility", value as CharacterVisibility)}
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
                    onValueChange={(value) => updateField("safety", value as CharacterSafety)}
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

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Tags</label>
                  <div className="space-y-2">
                    <Input
                      value={tagInput}
                      onChange={(event) => setTagInput(event.target.value)}
                      onKeyDown={onTagInputKeyDown}
                      onBlur={addTag}
                      placeholder="Add tag and press add"
                      aria-invalid={fieldErrors.tags ? "true" : "false"}
                      className={cn(fieldErrors.tags ? "border-destructive focus-visible:ring-destructive/40" : "")}
                    />
                    <div className="flex flex-wrap gap-2">
                      {formValues.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          render={
                            <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag} tag`} />
                          }
                          className="h-8 cursor-pointer rounded-full px-3 text-xs text-primary/80 hover:bg-muted"
                        >
                          {tag}
                          <span className="text-primary/80">×</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {fieldErrors.tags ? <p className="text-xs font-medium text-destructive">{fieldErrors.tags}</p> : null}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Author Notes</label>
                  <Textarea
                    value={formValues.authorNotes}
                    onChange={(event) => updateField("authorNotes", event.target.value)}
                    placeholder="Internal creator note"
                    aria-invalid={fieldErrors.authorNotes ? "true" : "false"}
                    className={cn(fieldErrors.authorNotes ? "border-destructive focus-visible:ring-destructive/40" : "")}
                  />
                  {fieldErrors.authorNotes ? (
                    <p className="text-xs font-medium text-destructive">{fieldErrors.authorNotes}</p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Character Notes</label>
                  <Textarea
                    value={formValues.characterNotes}
                    onChange={(event) => updateField("characterNotes", event.target.value)}
                    placeholder="Private usage notes"
                    aria-invalid={fieldErrors.characterNotes ? "true" : "false"}
                    className={cn(fieldErrors.characterNotes ? "border-destructive focus-visible:ring-destructive/40" : "")}
                  />
                  {fieldErrors.characterNotes ? (
                    <p className="text-xs font-medium text-destructive">{fieldErrors.characterNotes}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  )
}
