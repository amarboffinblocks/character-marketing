"use client"

import { useMemo, useState, type FormEvent } from "react"
import { Minus, Plus } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { CreatorServicePackage } from "@/features/creator-profile/model/creator-profile-types"
import { cn } from "@/lib/utils"

type PurchasePreselectDialogProps = {
  pkg: CreatorServicePackage
  creatorName: string
  triggerClassName?: string
}

export function PurchasePreselectDialog({
  pkg,
  creatorName,
  triggerClassName,
}: PurchasePreselectDialogProps) {
  const [price, setPrice] = useState(String(pkg.price))
  const [tokenCount, setTokenCount] = useState(pkg.tokensLabel.replace("Tokens: ", ""))
  const [character, setCharacter] = useState(1)
  const [persona, setPersona] = useState(1)
  const [lorebook, setLorebook] = useState(0)
  const [background, setBackground] = useState(0)
  const [avatar, setAvatar] = useState(0)
  const [message, setMessage] = useState("")

  const normalizedPrice = useMemo(() => {
    const n = Number(price)
    return Number.isFinite(n) && n > 0 ? n : pkg.price
  }, [price, pkg.price])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const subject = `Purchase Pre-Select: ${pkg.title} by ${creatorName}`
    const lines = [
      `Creator: ${creatorName}`,
      `Package: ${pkg.title}`,
      `Price: $${normalizedPrice}`,
      `Token count: ${tokenCount || "Not provided"}`,
      "",
      "Requested assets:",
      `- Character: ${character}`,
      `- Persona: ${persona}`,
      `- Lorebook: ${lorebook}`,
      `- Background: ${background}`,
      `- Avatar: ${avatar}`,
      "",
      "Message to creator:",
      message || "No additional message",
    ]

    const href = `mailto:support@character.market?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      lines.join("\n")
    )}`
    window.location.href = href
  }

  return (
    <Dialog>
      <DialogTrigger
        className={cn(buttonVariants({ size: "lg" }), "h-10 w-full", triggerClassName)}
      >
        Purchase Pre-Select
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Purchase Pre-Select</DialogTitle>
          <DialogDescription>
            Configure this package before checkout. Your request will be sent to {creatorName}.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
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

          <DialogFooter>
            <DialogClose
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10")}
            >
              Cancel
            </DialogClose>
            <button
              type="submit"
              className={cn(buttonVariants({ size: "lg" }), "h-10")}
            >
              Continue Purchase
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
