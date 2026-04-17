"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  LorebookEntry,
  LorebookSafety,
  LorebookVisibility,
} from "@/features/creator/workspace/lorebooks/lorebooks-data"
import { cn } from "@/lib/utils"

type LorebookFormValues = {
  lorebookName: string
  avatarUrl: string
  tags: string[]
  safety: LorebookSafety
  visibility: LorebookVisibility
  entries: LorebookEntry[]
}

function createEntry(): LorebookEntry {
  return {
    id: crypto.randomUUID(),
    keywords: "",
    context: "",
  }
}

const defaultFormValues: LorebookFormValues = {
  lorebookName: "",
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
  const [formValues, setFormValues] = useState<LorebookFormValues>(defaultFormValues)
  const [tagInput, setTagInput] = useState("")

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

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="space-y-2">
          <Link
            href="/dashboard/creator/workspace/lorebooks"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-7 w-fit px-2 text-muted-foreground"
            )}
          >
            <ArrowLeft className="size-3.5" />
            Back to Lorebooks
          </Link>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Create Lorebook
          </h2>
          <p className="text-sm text-muted-foreground">
            Add lorebook details and build multiple keyword-context entries.
          </p>
        </div>
      </section>

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle>Lorebook Details</CardTitle>
          <CardDescription>
            Define metadata and add entries that will be used as retrieval memory.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 py-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Lorebook Name</label>
              <Input
                value={formValues.lorebookName}
                onChange={(event) => updateField("lorebookName", event.target.value)}
                placeholder="Enter lorebook name"
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
            <div className="space-y-1.5">
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

          <div className="space-y-3 border-t border-border pt-4">
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
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">
              Total entry tokens: <span className="font-medium text-foreground">{totalTokens}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={resetForm}>
                Reset
              </Button>
              <Button type="button" variant="outline">
                Save Draft
              </Button>
              <Button type="button">Create Lorebook</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
