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
  CharacterSafety,
  CharacterStatus,
  CharacterVisibility,
} from "@/features/creator/workspace/characters/characters-data"
import { cn } from "@/lib/utils"

type CharacterFormValues = {
  characterName: string
  avatarUrl: string
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

const defaultFormValues: CharacterFormValues = {
  characterName: "",
  avatarUrl: "",
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

export function CharacterCreateFormView() {
  const [formValues, setFormValues] = useState<CharacterFormValues>(defaultFormValues)
  const [tagInput, setTagInput] = useState("")

  function updateField<Key extends keyof CharacterFormValues>(
    key: Key,
    value: CharacterFormValues[Key]
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
            href="/dashboard/creator/workspace/characters"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-7 w-fit px-2 text-muted-foreground"
            )}
          >
            <ArrowLeft className="size-3.5" />
            Back to Characters
          </Link>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Create Character
          </h2>
          <p className="text-sm text-muted-foreground">
            Build a reusable character card with behavior, dialogue style, and internal notes.
          </p>
        </div>
      </section>

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle>Character Details</CardTitle>
          <CardDescription>
            Use the same field structure used in custom package requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 py-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Character Name</label>
              <Input
                value={formValues.characterName}
                onChange={(event) => updateField("characterName", event.target.value)}
                placeholder="Enter character name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Avatar URL</label>
              <Input
                value={formValues.avatarUrl}
                onChange={(event) => updateField("avatarUrl", event.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Visibility</label>
              <Select
                value={formValues.visibility}
                onValueChange={(value) => updateField("visibility", value as CharacterVisibility)}
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
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Safety</label>
              <Select
                value={formValues.safety}
                onValueChange={(value) => updateField("safety", value as CharacterSafety)}
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

          <div className="grid gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <Textarea
                value={formValues.description}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="Describe the character in detail..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Scenario</label>
              <Textarea
                value={formValues.scenario}
                onChange={(event) => updateField("scenario", event.target.value)}
                placeholder="Scenario / location / universe"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Personality Summary
              </label>
              <Textarea
                value={formValues.personalitySummary}
                onChange={(event) => updateField("personalitySummary", event.target.value)}
                placeholder="Character personality"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">First Message</label>
              <Textarea
                value={formValues.firstMessage}
                onChange={(event) => updateField("firstMessage", event.target.value)}
                placeholder="Initial in-character message"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Alternative Message
              </label>
              <Textarea
                value={formValues.alternativeMessages}
                onChange={(event) => updateField("alternativeMessages", event.target.value)}
                placeholder="Alternative opening lines"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Example Dialogue
              </label>
              <Textarea
                value={formValues.exampleDialogue}
                onChange={(event) => updateField("exampleDialogue", event.target.value)}
                placeholder="Sample dialogue style"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Author Notes</label>
                <Textarea
                  value={formValues.authorNotes}
                  onChange={(event) => updateField("authorNotes", event.target.value)}
                  placeholder="Internal creator note"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Character Notes
                </label>
                <Textarea
                  value={formValues.characterNotes}
                  onChange={(event) => updateField("characterNotes", event.target.value)}
                  placeholder="Private usage notes"
                />
              </div>
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
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
            <Button type="button" variant="ghost" onClick={resetForm}>
              Reset
            </Button>
            <Button type="button" variant="outline">
              Save Draft
            </Button>
            <Button type="button">Create Character</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
