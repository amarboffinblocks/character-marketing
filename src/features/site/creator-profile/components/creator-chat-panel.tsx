"use client"

import Image from "next/image"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import { MessageSquare, Send, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type ChatMessage = {
  id: string
  role: "user" | "creator"
  text: string
  timeLabel: string
}

function nowLabel() {
  return new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}

type CreatorChatPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  creatorId: string
  creatorName: string
  creatorHandle: string
  creatorAvatar: string
}

export function CreatorChatPanel({
  open,
  onOpenChange,
  creatorId,
  creatorName,
  creatorHandle,
  creatorAvatar,
}: CreatorChatPanelProps) {
  const titleId = useId()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: `welcome-${creatorId}`,
      role: "creator",
      text: `Hi — I'm ${creatorName}. Tell me about your project and I'll reply here when I'm available.`,
      timeLabel: nowLabel(),
    },
  ])
  const endRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    if (open) scrollToBottom()
  }, [open, messages, scrollToBottom])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onOpenChange])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    const userMsg: ChatMessage = {
      id: `u-${crypto.randomUUID()}`,
      role: "user",
      text: trimmed,
      timeLabel: nowLabel(),
    }
    setMessages((m) => [...m, userMsg])
    setInput("")
  }

  if (!open) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[90] "
        aria-label="Close chat"
        onClick={() => onOpenChange(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "fixed bottom-4 right-4 z-[100] flex h-[min(560px,calc(100vh-2rem))] w-[min(calc(100vw-2rem),420px)] flex-col overflow-hidden",
          "rounded-2xl border border-border bg-card text-card-foreground shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200"
        )}
      >
        <div className="flex items-center gap-3 border-b border-border/80 bg-muted/30 px-4 py-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
            <Image
              src={creatorAvatar}
              alt=""
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p id={titleId} className="truncate text-sm font-semibold text-foreground">
              Chat with {creatorName}
            </p>
            <p className="truncate text-xs text-muted-foreground">@{creatorHandle}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            aria-label="Close chat"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md border border-border/80 bg-muted/50 text-foreground"
                )}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                <p
                  className={cn(
                    "mt-1 text-[10px]",
                    m.role === "user" ? "text-primary-foreground/75" : "text-muted-foreground"
                  )}
                >
                  {m.timeLabel}
                </p>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="border-t border-border/80 bg-background/95 p-3 backdrop-blur-sm"
        >
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message…"
              className="min-h-10 flex-1"
              autoComplete="off"
              aria-label="Message"
            />
            <Button type="submit" size="icon" className="shrink-0" aria-label="Send message">
              <Send className="size-4" />
            </Button>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <MessageSquare className="size-3 shrink-0" aria-hidden />
            Demo chat — messages stay on this device until you connect a real inbox.
          </p>
        </form>
      </div>
    </>
  )
}
