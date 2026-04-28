"use client"

import { useMemo, useState, type FormEvent } from "react"
import { Minus, Plus } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type PurchasePreselectFormProps = {
  creatorId: string
  packageId: string
  packageTitle: string
  packagePrice: number
  tokensLabel: string
  creatorName: string
}

export function PurchasePreselectForm({
  creatorId,
  packageId,
  packageTitle,
  packagePrice,
  tokensLabel,
  creatorName,
}: PurchasePreselectFormProps) {
  const [price, setPrice] = useState(String(packagePrice))
  const [tokenCount, setTokenCount] = useState(tokensLabel.replace("Tokens: ", ""))
  const [character, setCharacter] = useState(1)
  const [persona, setPersona] = useState(1)
  const [lorebook, setLorebook] = useState(0)
  const [background, setBackground] = useState(0)
  const [avatar, setAvatar] = useState(0)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const normalizedPrice = useMemo(() => {
    const n = Number(price)
    return Number.isFinite(n) && n > 0 ? n : packagePrice
  }, [price, packagePrice])

  const requestSchema = useMemo(
    () =>
      z.object({
        price: z.number().int().positive("Price must be greater than 0"),
        tokenCount: z.string().trim().min(1, "Token count is required"),
        requestedAssets: z.object({
          character: z.number().int().nonnegative(),
          persona: z.number().int().nonnegative(),
          lorebook: z.number().int().nonnegative(),
          background: z.number().int().nonnegative(),
          avatar: z.number().int().nonnegative(),
        }),
        messageToCreator: z.string().trim().default(""),
      }),
    []
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsed = requestSchema.safeParse({
      price: normalizedPrice,
      tokenCount,
      requestedAssets: { character, persona, lorebook, background, avatar },
      messageToCreator: message,
    })

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form values.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/site/purchase-preselect-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId,
          packageId,
          packageTitle,
          packagePrice: parsed.data.price,
          tokensLabel,
          tokenCount: parsed.data.tokenCount,
          requestedAssets: parsed.data.requestedAssets,
          messageToCreator: parsed.data.messageToCreator,
        }),
      })

      const result = (await response.json()) as { error?: string; details?: string }
      if (!response.ok) {
        const messageText = result.error ?? "Unable to submit pre-select request."
        toast.error(result.details ? `${messageText} (${result.details})` : messageText)
        return
      }

      toast.success("Your pre-select package request has been submitted successfully.")
      setPrice(String(packagePrice))
      setTokenCount(tokensLabel.replace("Tokens: ", ""))
      setCharacter(1)
      setPersona(1)
      setLorebook(0)
      setBackground(0)
      setAvatar(0)
      setMessage("")
    } catch {
      toast.error("Unable to submit pre-select request.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-5 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="purchase-price" className="text-sm font-medium text-foreground">
            Price
          </label>
          <Input
            id="purchase-price"
            inputMode="decimal"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="35"
            required
          />
        </div>
        <div className="space-y-1.5">
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
        <label htmlFor="message-to-creator" className="text-sm font-medium text-foreground">
          Message to creator
        </label>
        <Textarea
          id="message-to-creator"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Share style references, tone, and must-have details."
          rows={5}
        />
      </div>

      <div className="flex justify-end border-t border-border/60 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(buttonVariants({ size: "lg" }), "h-10")}
        >
          {isSubmitting ? "Submitting..." : "Send Request"}
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
