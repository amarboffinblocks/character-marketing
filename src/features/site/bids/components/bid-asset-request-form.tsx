"use client"

import { useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type SafetyRating = "SFW" | "NSFW"
type AssetLimits = { character: number; persona: number; lorebook: number; background: number; avatar: number }
type StepId = "character" | "persona" | "lorebook" | "background" | "avatar"

type BidAssetRequestFormProps = {
  limits: AssetLimits
  onBack: () => void
  onSubmit: (payload: Record<string, unknown>) => void | Promise<void>
}

const ALL_STEPS: { id: StepId; label: string }[] = [
  { id: "character", label: "Character" },
  { id: "persona", label: "Persona" },
  { id: "lorebook", label: "Lorebook" },
  { id: "background", label: "Background" },
  { id: "avatar", label: "Avatar" },
]

function emptyItem(step: StepId): Record<string, string> {
  const base: Record<string, string> = { messageToCreator: "", description: "", safety: "SFW" }
  if (step === "character") return { ...base, characterName: "", characterTags: "", scenarioLocationUniverse: "", personalitySummary: "", firstMessage: "", exampleDialogueStyle: "" }
  if (step === "persona") return { ...base, personaName: "", personaTags: "", personaDetails: "" }
  if (step === "lorebook") return { ...base, lorebookName: "", lorebookTags: "", estimatedKeywordCount: "", specificKeywordsOrTerms: "" }
  if (step === "background") return { ...base, backgroundName: "", referenceUrl1: "", referenceUrl2: "", referenceUrl3: "" }
  return { ...base, avatarName: "", referenceUrl1: "", referenceUrl2: "", referenceUrl3: "" }
}

function SafetySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? "SFW")}>
      <SelectTrigger><SelectValue placeholder="Content safety" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="SFW">SFW</SelectItem>
        <SelectItem value="NSFW">NSFW</SelectItem>
      </SelectContent>
    </Select>
  )
}

function ItemEditor({ stepId, item, onChange }: { stepId: StepId; item: Record<string, string>; onChange: (updated: Record<string, string>) => void }) {
  const set = (key: string, val: string) => onChange({ ...item, [key]: val })

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-background p-4">
      <Textarea placeholder="Message to Creator" value={item.messageToCreator ?? ""} onChange={(e) => set("messageToCreator", e.target.value)} />

      {stepId === "character" && (
        <>
          <Input placeholder="Character Name" value={item.characterName ?? ""} onChange={(e) => set("characterName", e.target.value)} />
          <Input placeholder="Character Tags" value={item.characterTags ?? ""} onChange={(e) => set("characterTags", e.target.value)} />
          <Textarea placeholder="Description" value={item.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          <Textarea placeholder="Scenario / Location / Universe" value={item.scenarioLocationUniverse ?? ""} onChange={(e) => set("scenarioLocationUniverse", e.target.value)} />
          <Textarea placeholder="Personality Summary" value={item.personalitySummary ?? ""} onChange={(e) => set("personalitySummary", e.target.value)} />
          <Textarea placeholder="First Message" value={item.firstMessage ?? ""} onChange={(e) => set("firstMessage", e.target.value)} />
          <Textarea placeholder="Example Dialogue / Speaking Style" value={item.exampleDialogueStyle ?? ""} onChange={(e) => set("exampleDialogueStyle", e.target.value)} />
        </>
      )}
      {stepId === "persona" && (
        <>
          <Input placeholder="Persona Name" value={item.personaName ?? ""} onChange={(e) => set("personaName", e.target.value)} />
          <Input placeholder="Persona Tags" value={item.personaTags ?? ""} onChange={(e) => set("personaTags", e.target.value)} />
          <Textarea placeholder="Persona Details" value={item.personaDetails ?? ""} onChange={(e) => set("personaDetails", e.target.value)} />
        </>
      )}
      {stepId === "lorebook" && (
        <>
          <Input placeholder="Lorebook Name (optional)" value={item.lorebookName ?? ""} onChange={(e) => set("lorebookName", e.target.value)} />
          <Input placeholder="Lorebook Tags" value={item.lorebookTags ?? ""} onChange={(e) => set("lorebookTags", e.target.value)} />
          <Input placeholder="Estimated Keyword Count" value={item.estimatedKeywordCount ?? ""} onChange={(e) => set("estimatedKeywordCount", e.target.value)} />
          <Textarea placeholder="Description" value={item.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          <Textarea placeholder="Specific Keywords or Terms" value={item.specificKeywordsOrTerms ?? ""} onChange={(e) => set("specificKeywordsOrTerms", e.target.value)} />
        </>
      )}
      {(stepId === "background" || stepId === "avatar") && (
        <>
          <Input placeholder={`${stepId === "background" ? "Background" : "Avatar"} Name (optional)`} value={item[stepId === "background" ? "backgroundName" : "avatarName"] ?? ""} onChange={(e) => set(stepId === "background" ? "backgroundName" : "avatarName", e.target.value)} />
          <Textarea placeholder="Description" value={item.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          <Input placeholder="Reference URL 1" value={item.referenceUrl1 ?? ""} onChange={(e) => set("referenceUrl1", e.target.value)} />
          <Input placeholder="Reference URL 2" value={item.referenceUrl2 ?? ""} onChange={(e) => set("referenceUrl2", e.target.value)} />
          <Input placeholder="Reference URL 3" value={item.referenceUrl3 ?? ""} onChange={(e) => set("referenceUrl3", e.target.value)} />
        </>
      )}

      <SafetySelect value={item.safety ?? "SFW"} onChange={(v) => set("safety", v)} />
    </div>
  )
}

export function BidAssetRequestForm({ limits, onBack, onSubmit }: BidAssetRequestFormProps) {
  const activeSteps = useMemo(() => ALL_STEPS.filter((s) => limits[s.id] > 0), [limits])
  const [stepIdx, setStepIdx] = useState(0)
  const [data, setData] = useState<Record<StepId, Record<string, string>[]>>({ character: [], persona: [], lorebook: [], background: [], avatar: [] })
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (activeSteps.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-12 text-center">
          <p className="text-sm text-muted-foreground">No asset types selected. You can publish directly.</p>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" size="lg" onClick={onBack}>Back</Button>
          <Button size="lg" onClick={() => void onSubmit({})}>Publish Bid</Button>
        </div>
      </div>
    )
  }

  const step = activeSteps[stepIdx]
  const stepId = step.id
  const limit = limits[stepId]
  const items = data[stepId]
  const progress = ((stepIdx + 1) / activeSteps.length) * 100

  const addItem = () => {
    if (items.length >= limit) return
    const next = [...items, emptyItem(stepId)]
    setData((prev) => ({ ...prev, [stepId]: next }))
    setEditIdx(next.length - 1)
  }

  const removeItem = (i: number) => {
    setData((prev) => ({ ...prev, [stepId]: prev[stepId].filter((_, idx) => idx !== i) }))
    if (editIdx === i) setEditIdx(null)
    else if (editIdx !== null && editIdx > i) setEditIdx(editIdx - 1)
  }

  const updateItem = (i: number, updated: Record<string, string>) => {
    setData((prev) => ({ ...prev, [stepId]: prev[stepId].map((item, idx) => (idx === i ? updated : item)) }))
  }

  const handleNext = () => {
    setEditIdx(null)
    if (stepIdx < activeSteps.length - 1) {
      setStepIdx(stepIdx + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleBack = () => {
    setEditIdx(null)
    if (stepIdx > 0) setStepIdx(stepIdx - 1)
    else onBack()
  }

  const handlePublish = async () => {
    setSubmitting(true)
    try {
      await onSubmit(data)
    } catch {
      toast.error("Failed to publish bid")
    } finally {
      setSubmitting(false)
    }
  }

  const isLast = stepIdx === activeSteps.length - 1

  return (
    <div className="space-y-6">
      {/* Step progress */}
      <Card className="border-none bg-transparent shadow-none ring-0">
        <CardContent className="space-y-5 pt-6">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-linear-to-r from-primary to-violet-400 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <ol className="flex flex-wrap gap-2">
            {activeSteps.map((s, i) => (
              <li key={s.id} className="flex min-w-[120px] flex-1 items-center gap-2 rounded-lg border border-border/60 px-2.5 py-2">
                <span className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${i === stepIdx ? "bg-primary text-primary-foreground" : i < stepIdx ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>
                  {i < stepIdx ? <CheckCircle2 className="size-3.5" /> : i + 1}
                </span>
                <span className={`truncate text-xs font-medium ${i === stepIdx ? "text-foreground" : i < stepIdx ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Current step card */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">{step.label} Requests</CardTitle>
            <Badge variant="secondary">{items.length}/{limit} item{limit === 1 ? "" : "s"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {items.length === 0 && (
            <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              No {step.label.toLowerCase()} added yet.
            </div>
          )}

          {items.map((item, i) =>
            editIdx === i ? (
              <div key={i} className="space-y-3">
                <ItemEditor stepId={stepId} item={item} onChange={(u) => updateItem(i, u)} />
                <div className="flex justify-end">
                  <Button type="button" size="sm" onClick={() => setEditIdx(null)}>Save</Button>
                </div>
              </div>
            ) : (
              <Card key={i} className="bg-background">
                <CardContent className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{step.label} {i + 1}</p>
                    <p className="text-xs text-muted-foreground">Click edit to update details.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setEditIdx(i)}>
                      <Pencil className="mr-1 size-3.5" /> Edit
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(i)}>
                      <Trash2 className="mr-1 size-3.5" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          )}

          <Button type="button" variant="outline" className="w-full" onClick={addItem} disabled={items.length >= limit}>
            <Plus className="mr-1 size-4" />
            {items.length === 0 ? `Add ${step.label}` : `Add More ${step.label}`}
          </Button>
          {items.length >= limit && <p className="text-center text-xs text-muted-foreground">Maximum limit reached.</p>}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4 py-2">
        <Button type="button" variant="outline" size="lg" onClick={handleBack} disabled={submitting}>Back</Button>
        {isLast ? (
          <Button type="button" size="lg" onClick={handlePublish} disabled={submitting}>
            {submitting ? "Publishing..." : "Publish Bid"}
          </Button>
        ) : (
          <Button type="button" size="lg" onClick={handleNext}>Next</Button>
        )}
      </div>
    </div>
  )
}
