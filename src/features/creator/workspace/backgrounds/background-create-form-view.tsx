"use client"

import Link from "next/link"
import { type ChangeEvent, type KeyboardEvent, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, Frame, ImagePlus } from "lucide-react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { SectionTabs, type SectionTabItem } from "@/features/creator/shared/section-tabs"
import {
  BackgroundSafety,
  BackgroundType,
  BackgroundVisibility,
} from "@/features/creator/workspace/backgrounds/backgrounds-data"
import { cn } from "@/lib/utils"

type BackgroundCreateTab = "basic" | "meta"

type BackgroundFormValues = {
  backgroundName: string
  imageUrl: string
  tags: string[]
  safety: BackgroundSafety
  visibility: BackgroundVisibility
  type: BackgroundType
  notes: string
}

type BackgroundFieldErrorKey = "backgroundName" | "imageUrl" | "tags" | "notes"

const backgroundCreateTabs: SectionTabItem<BackgroundCreateTab>[] = [
  { value: "basic", label: "Basic info", icon: Frame },
  { value: "meta", label: "Visibility & safety", icon: CheckCircle2 },
]

const defaultFormValues: BackgroundFormValues = {
  backgroundName: "",
  imageUrl: "",
  tags: [],
  safety: "SFW",
  visibility: "private",
  type: "indoor",
  notes: "",
}

export function BackgroundCreateFormView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")?.trim() ?? ""
  const isEditMode = Boolean(editId)
  const [formValues, setFormValues] = useState<BackgroundFormValues>(defaultFormValues)
  const [tagInput, setTagInput] = useState("")
  const [tab, setTab] = useState<BackgroundCreateTab>("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingEditBackground, setIsLoadingEditBackground] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<BackgroundFieldErrorKey, string>>>({})

  function updateField<Key extends keyof BackgroundFormValues>(
    key: Key,
    value: BackgroundFormValues[Key]
  ) {
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

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("kind", "banner")

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

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    try {
      const url = await uploadImage(file)
      updateField("imageUrl", url)
      setFieldErrors((current) => ({ ...current, imageUrl: undefined }))
      toast.success("Background uploaded")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed."
      toast.error("Background upload failed", { description: message })
    } finally {
      setIsUploadingImage(false)
      event.target.value = ""
    }
  }

  useEffect(() => {
    let mounted = true
    if (!editId) return

    async function loadBackgroundForEdit() {
      setIsLoadingEditBackground(true)
      try {
        const response = await fetch(`/api/creator/backgrounds?id=${editId}`)
        const payload = (await response.json()) as {
          item?: Partial<BackgroundFormValues> | null
          error?: string
          details?: string
        }
        if (!response.ok || !payload.item) {
          toast.error("Unable to load background details", {
            description: payload.details ?? payload.error ?? "Please try again.",
          })
          return
        }
        if (!mounted) return
        setFormValues({
          backgroundName: payload.item.backgroundName ?? "",
          imageUrl: payload.item.imageUrl ?? "",
          tags: Array.isArray(payload.item.tags) ? payload.item.tags : [],
          safety: (payload.item.safety as BackgroundSafety) ?? "SFW",
          visibility: (payload.item.visibility as BackgroundVisibility) ?? "private",
          type: (payload.item.type as BackgroundType) ?? "indoor",
          notes: payload.item.notes ?? "",
        })
      } catch {
        toast.error("Unable to load background details")
      } finally {
        if (mounted) setIsLoadingEditBackground(false)
      }
    }

    void loadBackgroundForEdit()
    return () => {
      mounted = false
    }
  }, [editId])

  function validateForm(values: BackgroundFormValues) {
    const errors: Partial<Record<BackgroundFieldErrorKey, string>> = {}
    if (!values.backgroundName.trim()) errors.backgroundName = "Background name is required."
    if (!values.imageUrl.trim()) errors.imageUrl = "Background image is required."
    if (!values.tags.length) errors.tags = "At least one tag is required."
    if (!values.notes.trim()) errors.notes = "Notes are required."
    return errors
  }

  function tabForField(field: BackgroundFieldErrorKey): BackgroundCreateTab {
    return field === "backgroundName" || field === "imageUrl" || field === "tags" || field === "notes"
      ? "basic"
      : "meta"
  }

  async function submitBackground() {
    if (isSubmitting) return
    const validationErrors = validateForm(formValues)
    const missingFields = Object.keys(validationErrors) as BackgroundFieldErrorKey[]
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
      const endpoint = isEditMode ? `/api/creator/backgrounds?id=${editId}` : "/api/creator/backgrounds"
      const response = await fetch(endpoint, {
        method: isEditMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      })
      const payload = (await response.json()) as { error?: string; details?: string }
      if (!response.ok) {
        toast.error(isEditMode ? "Unable to update background" : "Unable to create background", {
          description: payload.details ?? payload.error ?? "Please try again.",
        })
        return
      }
      toast.success(isEditMode ? "Background updated successfully" : "Background created successfully")
      resetForm()
      router.push("/dashboard/creator/workspace/backgrounds")
      router.refresh()
    } catch {
      toast.error(isEditMode ? "Unable to update background" : "Unable to create background")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-card">
        <div className="relative h-40 overflow-hidden rounded-t-2xl sm:h-52">
          <Link
            href="/dashboard/creator/workspace/backgrounds"
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "absolute left-4 top-4 z-20 h-7 w-fit px-2 text-muted-foreground"
            )}
          >
            <ArrowLeft className="size-3.5" />
            Back to Backgrounds
          </Link>
          {formValues.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={formValues.imageUrl}
              alt="Background preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 via-accent/30 to-background">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Frame className="size-4" />
                Upload a background image
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/60 via-background/10 to-background/10" />
          <label className="absolute right-4 top-4 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background/85 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
            <ImagePlus className="size-3.5" />
            {isUploadingImage ? "Uploading..." : "Change background"}
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploadingImage}
              className="hidden"
            />
          </label>
          {fieldErrors.imageUrl ? (
            <p className="absolute bottom-3 right-4 text-xs font-medium text-destructive">
              {fieldErrors.imageUrl}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-4 px-4 pb-4 pt-2 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:pb-6 sm:pt-3">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="max-w-[170px] truncate text-xl font-semibold tracking-tight sm:max-w-none sm:text-3xl">
                {formValues.backgroundName.trim() || "Background name"}
              </h2>
              <Badge variant="secondary" className="gap-1 bg-primary/15 text-primary">
                <CheckCircle2 className="size-3" />
                Background draft
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formValues.notes.trim() || "Your background notes preview will appear here."}
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

          <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
            <Button type="button" variant="ghost" onClick={resetForm} className="flex-1 sm:flex-none">
              Reset
            </Button>
            <Button
              type="button"
              onClick={submitBackground}
              disabled={isSubmitting || isLoadingEditBackground || isUploadingImage}
              className="flex-1 sm:flex-none"
            >
              {isLoadingEditBackground
                ? "Loading..."
                : isSubmitting
                  ? isEditMode
                    ? "Saving..."
                    : "Creating..."
                  : isEditMode
                    ? "Edit Background"
                    : "Create Background"}
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
                <CardDescription className="text-xs">Live preview of the background card.</CardDescription>
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
                  {formValues.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formValues.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-primary">
                      {(formValues.backgroundName.trim().slice(0, 2) || "BG").toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {formValues.backgroundName.trim() || "Background name"}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground capitalize">{formValues.type}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {formValues.notes.trim() || "No notes yet."}
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
                  <Frame className="size-3" />
                  background
                </span>
                <span>{isEditMode ? "saved" : "draft"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <SectionTabs value={tab} onChange={setTab} items={backgroundCreateTabs} />

          {tab === "basic" ? (
            <Card>
              <CardHeader className="border-b pb-4">
                <CardTitle>Basic info</CardTitle>
                <CardDescription>Core background details buyers see first.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 py-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Background Name</label>
                  <Input
                    value={formValues.backgroundName}
                    onChange={(event) => updateField("backgroundName", event.target.value)}
                    placeholder="Enter background name"
                    aria-invalid={fieldErrors.backgroundName ? "true" : "false"}
                    className={cn(fieldErrors.backgroundName ? "border-destructive focus-visible:ring-destructive/40" : "")}
                  />
                  {fieldErrors.backgroundName ? (
                    <p className="text-xs font-medium text-destructive">{fieldErrors.backgroundName}</p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Type</label>
                  <Select
                    value={formValues.type}
                    onValueChange={(value) => updateField("type", value as BackgroundType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indoor">Indoor</SelectItem>
                      <SelectItem value="outdoor">Outdoor</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 md:col-span-2">
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
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Notes</label>
                  <Textarea
                    value={formValues.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    placeholder="Any creator notes for this background..."
                    className={cn(
                      "min-h-24",
                      fieldErrors.notes ? "border-destructive focus-visible:ring-destructive/40" : ""
                    )}
                    aria-invalid={fieldErrors.notes ? "true" : "false"}
                  />
                  {fieldErrors.notes ? <p className="text-xs font-medium text-destructive">{fieldErrors.notes}</p> : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {tab === "meta" ? (
            <Card>
              <CardHeader className="border-b pb-4">
                <CardTitle>Visibility and safety</CardTitle>
                <CardDescription>Marketplace controls for this background asset.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 py-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Visibility</label>
                  <Select
                    value={formValues.visibility}
                    onValueChange={(value) => updateField("visibility", value as BackgroundVisibility)}
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
                    onValueChange={(value) => updateField("safety", value as BackgroundSafety)}
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
