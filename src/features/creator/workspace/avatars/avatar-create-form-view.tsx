"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AvatarSafety, AvatarStyle, AvatarVisibility } from "@/features/creator/workspace/avatars/avatars-data"
import { cn } from "@/lib/utils"

type AvatarFormValues = {
  avatarName: string
  imageUrl: string
  tags: string[]
  safety: AvatarSafety
  visibility: AvatarVisibility
  style: AvatarStyle
  notes: string
}

const defaultFormValues: AvatarFormValues = {
  avatarName: "",
  imageUrl: "",
  tags: [],
  safety: "SFW",
  visibility: "private",
  style: "semi-real",
  notes: "",
}

export function AvatarCreateFormView() {
  const [formValues, setFormValues] = useState<AvatarFormValues>(defaultFormValues)
  const [tagInput, setTagInput] = useState("")

  function updateField<Key extends keyof AvatarFormValues>(key: Key, value: AvatarFormValues[Key]) {
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
            href="/dashboard/creator/workspace/avatars"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-7 w-fit px-2 text-muted-foreground"
            )}
          >
            <ArrowLeft className="size-3.5" />
            Back to Avatars
          </Link>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Create Avatar
          </h2>
          <p className="text-sm text-muted-foreground">
            Add new avatar assets for creator profile and package delivery.
          </p>
        </div>
      </section>

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle>Avatar Details</CardTitle>
          <CardDescription>Fill all important fields before publishing this avatar asset.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 py-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Avatar Name</label>
              <Input
                value={formValues.avatarName}
                onChange={(event) => updateField("avatarName", event.target.value)}
                placeholder="Enter avatar name"
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
              <label className="text-xs font-medium text-muted-foreground">Style</label>
              <Select
                value={formValues.style}
                onValueChange={(value) => updateField("style", value as AvatarStyle)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anime">Anime</SelectItem>
                  <SelectItem value="semi-real">Semi Real</SelectItem>
                  <SelectItem value="realistic">Realistic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Visibility</label>
              <Select
                value={formValues.visibility}
                onValueChange={(value) => updateField("visibility", value as AvatarVisibility)}
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
                onValueChange={(value) => updateField("safety", value as AvatarSafety)}
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
              placeholder="Any creator notes for this avatar..."
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
            <Button type="button">Create Avatar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
