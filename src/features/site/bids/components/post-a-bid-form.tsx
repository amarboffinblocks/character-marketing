"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Minus, Plus } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export type PostABidFormValues = {
  title: string
  duration: string
  budget: string
  tokenCount: string
  character: number
  persona: number
  lorebook: number
  background: number
  avatar: number
  skillsNeeded: string
  description: string
  isPriceNegotiable: boolean
  visibility: "open" | "closed"
}

const defaultValues: PostABidFormValues = {
  title: "",
  duration: "",
  budget: "",
  tokenCount: "",
  character: 1,
  persona: 1,
  lorebook: 0,
  background: 0,
  avatar: 0,
  skillsNeeded: "",
  description: "",
  isPriceNegotiable: false,
  visibility: "open",
}

type PostABidFormProps = {
  initialValues?: PostABidFormValues
  submitLabel?: string
  onSubmit: (values: PostABidFormValues) => void
  onCancel?: () => void
}

export function PostABidForm({
  initialValues = defaultValues,
  submitLabel = "Publish",
  onSubmit,
  onCancel,
}: PostABidFormProps) {
  const [title, setTitle] = useState(initialValues.title)
  const [duration, setDuration] = useState(initialValues.duration)
  const [budget, setBudget] = useState(initialValues.budget)
  const [tokenCount, setTokenCount] = useState(initialValues.tokenCount)
  const [character, setCharacter] = useState(initialValues.character)
  const [persona, setPersona] = useState(initialValues.persona)
  const [lorebook, setLorebook] = useState(initialValues.lorebook)
  const [background, setBackground] = useState(initialValues.background)
  const [avatar, setAvatar] = useState(initialValues.avatar)
  const [skillsNeeded, setSkillsNeeded] = useState(initialValues.skillsNeeded)
  const [description, setDescription] = useState(initialValues.description)
  const [isPriceNegotiable, setIsPriceNegotiable] = useState(initialValues.isPriceNegotiable)
  const [visibility, setVisibility] = useState<"open" | "closed">(initialValues.visibility)

  useEffect(() => {
    setTitle(initialValues.title)
    setDuration(initialValues.duration)
    setBudget(initialValues.budget)
    setTokenCount(initialValues.tokenCount)
    setCharacter(initialValues.character)
    setPersona(initialValues.persona)
    setLorebook(initialValues.lorebook)
    setBackground(initialValues.background)
    setAvatar(initialValues.avatar)
    setSkillsNeeded(initialValues.skillsNeeded)
    setDescription(initialValues.description)
    setIsPriceNegotiable(initialValues.isPriceNegotiable)
    setVisibility(initialValues.visibility)
  }, [initialValues])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    onSubmit({
      title,
      duration,
      budget,
      tokenCount,
      character,
      persona,
      lorebook,
      background,
      avatar,
      skillsNeeded,
      description,
      isPriceNegotiable,
      visibility,
    })
  }

  return (
    <form className="space-y-5 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="bid-title" className="text-sm font-medium text-foreground">
            Title
          </label>
          <Input
            id="bid-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Need anime-style creator for fantasy character set"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bid-duration" className="text-sm font-medium text-foreground">
            Duration
          </label>
          <Input
            id="bid-duration"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            placeholder="7 days"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bid-budget" className="text-sm font-medium text-foreground">
            Budget
          </label>
          <Input
            id="bid-budget"
            inputMode="decimal"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            placeholder="$100"
            required
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="token-count" className="text-sm font-medium text-foreground">
            Token count
          </label>
          <Input
            id="token-count"
            value={tokenCount}
            onChange={(event) => setTokenCount(event.target.value)}
            placeholder="Up to 800 tokens"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">Character</p>
          <CounterField value={character} onChange={setCharacter} />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">Persona</p>
          <CounterField value={persona} onChange={setPersona} />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">Lorebook</p>
          <CounterField value={lorebook} onChange={setLorebook} />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">Background</p>
          <CounterField value={background} onChange={setBackground} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <p className="text-sm font-medium text-foreground">Avatar</p>
          <CounterField value={avatar} onChange={setAvatar} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="skills-needed" className="text-sm font-medium text-foreground">
          Skills needed
        </label>
        <Input
          id="skills-needed"
          value={skillsNeeded}
          onChange={(event) => setSkillsNeeded(event.target.value)}
          placeholder="Character design, lore writing, portrait illustration"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="bid-description" className="text-sm font-medium text-foreground">
          Description
        </label>
        <Textarea
          id="bid-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Share project context, quality bar, references, and final deliverables."
          rows={5}
          required
        />
      </div>

      <label className="flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2">
        <input
          type="checkbox"
          checked={isPriceNegotiable}
          onChange={(event) => setIsPriceNegotiable(event.target.checked)}
          className="size-4 accent-primary"
        />
        <span className="text-sm text-foreground">Price negotiable</span>
      </label>

      <div className="space-y-1.5">
        <label htmlFor="bid-visibility" className="text-sm font-medium text-foreground">
          Visibility
        </label>
        <select
          id="bid-visibility"
          value={visibility}
          onChange={(event) => setVisibility(event.target.value as "open" | "closed")}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
        {onCancel ? (
          <button type="button" onClick={onCancel} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10")}>
            Cancel
          </button>
        ) : null}
        <button type="submit" className={cn(buttonVariants({ size: "lg" }), "h-10")}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

type CounterFieldProps = {
  value: number
  onChange: (value: number) => void
}

function CounterField({ value, onChange }: CounterFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Decrease quantity"
        className={cn(buttonVariants({ variant: "outline", size: "icon" }), "size-10")}
        onClick={() => onChange(Math.max(0, value - 1))}
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <Input
        value={value}
        onChange={(event) => {
          const n = Number(event.target.value)
          onChange(Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0)
        }}
        inputMode="numeric"
        type="number"
        min={0}
        className="h-10 text-center tabular-nums"
      />
      <button
        type="button"
        aria-label="Increase quantity"
        className={cn(buttonVariants({ variant: "outline", size: "icon" }), "size-10")}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  )
}
