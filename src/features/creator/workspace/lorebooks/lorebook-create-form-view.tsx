"use client"

import Link from "next/link"
import { type ChangeEvent, type KeyboardEvent, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, BookText, CheckCircle2, ImagePlus, Plus, Trash2, UserRound } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { SectionTabs, type SectionTabItem } from "@/features/creator/shared/section-tabs"
import {
  LorebookEntry,
  LorebookSafety,
  LorebookVisibility,
} from "@/features/creator/workspace/lorebooks/lorebooks-data"
import { cn } from "@/lib/utils"

type LorebookFormValues = {
  lorebookName: string
  description: string
  avatarUrl: string
  tags: string[]
  safety: LorebookSafety
  visibility: LorebookVisibility
  entries: LorebookEntry[]
}

type LorebookCreateTab = "basic" | "entries"

const lorebookCreateTabs: SectionTabItem<LorebookCreateTab>[] = [
  { value: "basic", label: "Basic info", icon: BookText },
  { value: "entries", label: "Entries", icon: Plus },
]

function createEntry(): LorebookEntry {
  return {
    id: crypto.randomUUID(),
    keywords: "",
    context: "",
  }
}

const defaultFormValues: LorebookFormValues = {
  lorebookName: "",
  description: "",
  avatarUrl: "",
  tags: [],
  safety: "SFW",
  visibility: "private",
  entries: [createEntry()],
}

function countTokens(input: string) {
  const trimmed = input.trim()
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length
}

export function LorebookCreateFormView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")?.trim() ?? ""
  const isEditMode = Boolean(editId)
  const [formValues, setFormValues] = useState<LorebookFormValues>(defaultFormValues)
  const [tagInput, setTagInput] = useState("")
  const [tab, setTab] = useState<LorebookCreateTab>("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingEditLorebook, setIsLoadingEditLorebook] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const totalTokens = useMemo(
    () => formValues.entries.reduce((total, entry) => total + countTokens(entry.context), 0),
    [formValues.entries]
  )

  function updateField<Key extends keyof LorebookFormValues>(
    key: Key,
    value: LorebookFormValues[Key]
  ) {
    setFormValues((current) => ({ ...current, [key]: value }))
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

  function addEntry() {
    updateField("entries", [...formValues.entries, createEntry()])
  }

  function removeEntry(entryId: string) {
    if (formValues.entries.length <= 1) return
    updateField(
      "entries",
      formValues.entries.filter((entry) => entry.id !== entryId)
    )
  }

  function updateEntry(entryId: string, key: "keywords" | "context", value: string) {
    updateField(
      "entries",
      formValues.entries.map((entry) => (entry.id === entryId ? { ...entry, [key]: value } : entry))
    )
  }

  function resetForm() {
    setFormValues({
      ...defaultFormValues,
      entries: [createEntry()],
    })
    setTagInput("")
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

    async function loadLorebookForEdit() {
      setIsLoadingEditLorebook(true)
      try {
        const response = await fetch(`/api/creator/lorebooks?id=${editId}`)
        const payload = (await response.json()) as {
          item?: LorebookFormValues | null
          error?: string
          details?: string
        }
        if (!response.ok || !payload.item) {
          toast.error("Unable to load lorebook details", {
            description: payload.details ?? payload.error ?? "Please try again.",
          })
          return
        }
        if (!mounted) return
        setFormValues({
          lorebookName: payload.item.lorebookName ?? "",
          description: payload.item.description ?? "",
          avatarUrl: payload.item.avatarUrl ?? "",
          tags: Array.isArray(payload.item.tags) ? payload.item.tags : [],
          safety: payload.item.safety ?? "SFW",
          visibility: payload.item.visibility ?? "private",
          entries:
            Array.isArray(payload.item.entries) && payload.item.entries.length > 0
              ? payload.item.entries
              : [createEntry()],
        })
      } catch {
        toast.error("Unable to load lorebook details")
      } finally {
        if (mounted) setIsLoadingEditLorebook(false)
      }
    }

    void loadLorebookForEdit()
    return () => {
      mounted = false
    }
  }, [editId])

  async function submitLorebook() {
    if (!formValues.lorebookName.trim()) {
      toast.warning("Lorebook name is required")
      return
    }
    if (!formValues.description.trim()) {
      toast.warning("Description is required")
      return
    }
    if (!formValues.avatarUrl.trim()) {
      toast.warning("Avatar is required")
      return
    }
    if (formValues.tags.length === 0) {
      toast.warning("At least one tag is required")
      return
    }
    if (formValues.entries.length === 0) {
      toast.warning("At least one entry is required")
      return
    }
    if (formValues.entries.some((entry) => entry.keywords.trim().length === 0)) {
      toast.warning("Each entry must include keywords")
      return
    }
    if (formValues.entries.some((entry) => entry.context.trim().length === 0)) {
      toast.warning("Each entry must include context")
      return
    }

    setIsSubmitting(true)
    try {
      const endpoint = isEditMode ? `/api/creator/lorebooks?id=${editId}` : "/api/creator/lorebooks"
      const response = await fetch(endpoint, {
        method: isEditMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      })
      const payload = (await response.json()) as { error?: string; details?: string }
      if (!response.ok) {
        toast.error(isEditMode ? "Unable to update lorebook" : "Unable to create lorebook", {
          description: payload.details ?? payload.error ?? "Please try again.",
        })
        return
      }
      toast.success(isEditMode ? "Lorebook updated successfully" : "Lorebook created successfully")
      resetForm()
      router.push("/dashboard/creator/workspace/lorebooks")
      router.refresh()
    } catch {
      toast.error(isEditMode ? "Unable to update lorebook" : "Unable to create lorebook")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-card">
        <div className="relative h-40 overflow-hidden rounded-t-2xl bg-linear-to-br from-primary/20 via-accent/30 to-background sm:h-52">
          <Link
            href="/dashboard/creator/workspace/lorebooks"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "absolute left-2 top-2 z-20 h-7 w-fit px-2 text-muted-foreground"
            )}
          >
            <ArrowLeft className="size-3.5" />
            Back to Lorebooks
          </Link>
        </div>
        <div className="flex flex-col gap-4 px-4 pb-4 pt-2 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:pb-6 sm:pt-3">
          <div className="flex min-w-0 gap-3 sm:gap-4">
            <div className="relative z-10 -mt-12 shrink-0 self-start">
              <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-muted shadow-md ring-2 ring-background sm:size-28">
                {formValues.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formValues.avatarUrl}
                    alt={formValues.lorebookName || "Lorebook avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-semibold text-primary">
                    {(formValues.lorebookName.trim().slice(0, 2) || "LB").toUpperCase()}
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
                  {formValues.lorebookName.trim() || "Lorebook name"}
                </h2>
                <Badge variant="secondary" className="gap-1 bg-primary/15 text-primary">
                  <CheckCircle2 className="size-3" />
                  Lorebook draft
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formValues.description.trim() || "Your lorebook description preview will appear here."}
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
              onClick={submitLorebook}
              disabled={isSubmitting || isLoadingEditLorebook || isUploadingAvatar}
              className="flex-1 sm:flex-none"
            >
              {isLoadingEditLorebook
                ? "Loading..."
                : isSubmitting
                  ? isEditMode
                    ? "Saving..."
                    : "Creating..."
                  : isEditMode
                    ? "Edit Lorebook"
                    : "Create Lorebook"}
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
                <CardDescription className="text-xs">Live preview of the lorebook card.</CardDescription>
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
                      {(formValues.lorebookName.trim().slice(0, 2) || "LB").toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {formValues.lorebookName.trim() || "Lorebook name"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {formValues.description.trim() || formValues.entries[0]?.context || "No description yet."}
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
                  <BookText className="size-3" />
                  {formValues.entries.length} entries
                </span>
                <span>{isEditMode ? "saved" : "draft"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <SectionTabs value={tab} onChange={setTab} items={lorebookCreateTabs} />

          {tab === "basic" ? (
            <Card>
              <CardHeader className="border-b pb-4">
                <CardTitle>Basic info</CardTitle>
                <CardDescription>Core lorebook details buyers see first.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 py-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Lorebook Name</label>
                  <Input
                    value={formValues.lorebookName}
                    onChange={(event) => updateField("lorebookName", event.target.value)}
                    placeholder="Enter lorebook name"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Description</label>
                  <Textarea
                    value={formValues.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    placeholder="Write a short summary of what this lorebook contains."
                    className="min-h-24"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Safety</label>
                  <Select
                    value={formValues.safety}
                    onValueChange={(value) => updateField("safety", value as LorebookSafety)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select safety" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SFW">SFW</SelectItem>
                      <SelectItem value="NSFW">NSFW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Visibility</label>
                  <Select
                    value={formValues.visibility}
                    onValueChange={(value) => updateField("visibility", value as LorebookVisibility)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="unlisted">Unlisted</SelectItem>
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
                </div>
              </CardContent>
            </Card>
          ) : null}

          {tab === "entries" ? (
            <Card>
              <CardHeader className="border-b pb-4">
                <CardTitle>Lore entries</CardTitle>
                <CardDescription>Build multiple keyword-context memory entries.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 py-4">
                {formValues.entries.map((entry, index) => (
                  <div key={entry.id} className="rounded-2xl border border-border/70 bg-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">Entry {index + 1}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEntry(entry.id)}
                        disabled={formValues.entries.length <= 1}
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Keywords or Terms</label>
                        <Input
                          value={entry.keywords}
                          onChange={(event) => updateEntry(entry.id, "keywords", event.target.value)}
                          placeholder="Please enter the keyword or term here. Separate multiple values with commas."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Context</label>
                        <Textarea
                          value={entry.context}
                          onChange={(event) => updateEntry(entry.id, "context", event.target.value)}
                          placeholder="Enter a short description about the keyword or term."
                          className="min-h-24"
                        />
                        <p className="text-right text-xs text-muted-foreground">
                          {countTokens(entry.context)} tokens
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" className="w-full" onClick={addEntry}>
                  <Plus className="size-4" />
                  Add New Entry
                </Button>
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground">
                  Total entry tokens: <span className="font-medium text-foreground">{totalTokens}</span>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  )
}
