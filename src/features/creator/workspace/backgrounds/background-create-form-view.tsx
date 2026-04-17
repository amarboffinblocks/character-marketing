"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  BackgroundSafety,
  BackgroundType,
  BackgroundVisibility,
} from "@/features/creator/workspace/backgrounds/backgrounds-data"
import { cn } from "@/lib/utils"

type BackgroundFormValues = {
  backgroundName: string
  imageUrl: string
  tags: string[]
  safety: BackgroundSafety
  visibility: BackgroundVisibility
  type: BackgroundType
  notes: string
}

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
  const [formValues, setFormValues] = useState<BackgroundFormValues>(defaultFormValues)
  const [tagInput, setTagInput] = useState("")

  function updateField<Key extends keyof BackgroundFormValues>(
    key: Key,
    value: BackgroundFormValues[Key]
  ) {
    setFormValues((current) => ({ ...current, [key]: value }))
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

  function removeTag(tag: string) {
    updateField(
      "tags",
      formValues.tags.filter((value) => value !== tag)
    )
  }

  function resetForm() {
    setFormValues(defaultFormValues)
    setTagInput("")
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="space-y-2">
          <Link
            href="/dashboard/creator/workspace/backgrounds"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-7 w-fit px-2 text-muted-foreground"
            )}
          >
            <ArrowLeft className="size-3.5" />
            Back to Backgrounds
          </Link>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Create Background
          </h2>
          <p className="text-sm text-muted-foreground">
            Add reusable scene backgrounds for consistent visual delivery.
          </p>
        </div>
      </section>

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle>Background Details</CardTitle>
          <CardDescription>
            Configure metadata, safety, visibility, and background context notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 py-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Background Name</label>
              <Input
                value={formValues.backgroundName}
                onChange={(event) => updateField("backgroundName", event.target.value)}
                placeholder="Enter background name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Image URL</label>
              <Input
                value={formValues.imageUrl}
                onChange={(event) => updateField("imageUrl", event.target.value)}
                placeholder="https://..."
              />
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
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Visibility</label>
              <Select
                value={formValues.visibility}
                onValueChange={(value) => updateField("visibility", value as BackgroundVisibility)}
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
              <label className="text-xs font-medium text-muted-foreground">Safety</label>
              <Select
                value={formValues.safety}
                onValueChange={(value) => updateField("safety", value as BackgroundSafety)}
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
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Tags</label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                placeholder="Add tag and press add"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {formValues.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted"
                >
                  {tag} ×
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Notes</label>
            <Textarea
              value={formValues.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Any creator notes for this background..."
              className="min-h-24"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
            <Button type="button" variant="ghost" onClick={resetForm}>
              Reset
            </Button>
            <Button type="button" variant="outline">
              Save Draft
            </Button>
            <Button type="button">Create Background</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
