"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import { MessageSquare, Send, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fetchThreadMessages, openOrCreateThread, sendThreadMessage } from "@/features/messaging/api"
import { formatMessageTime, type MessageItem } from "@/features/messaging/types"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type ChatMessage = {
  id: string
  role: "user" | "creator"
  text: string
  timeLabel: string
}

function createWelcomeMessage(creatorId: string, creatorName: string): ChatMessage {
  return {
    id: `welcome-${creatorId}`,
    role: "creator",
    text: `Hi — I'm ${creatorName}. Tell me about your project and I'll reply here when I'm available.`,
    timeLabel: formatMessageTime(new Date().toISOString()),
  }
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
  const supabase = useMemo(() => createClientSupabaseClient(), [])
  const [input, setInput] = useState("")
  const [threadId, setThreadId] = useState("")
  const [isInitializing, setIsInitializing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createWelcomeMessage(creatorId, creatorName)])
  const endRef = useRef<HTMLDivElement>(null)
  const initPromiseRef = useRef<Promise<void> | null>(null)

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

  const mapMessage = useCallback((item: MessageItem): ChatMessage => {
    return {
      id: item.id,
      role: item.senderRole === "buyer" ? "user" : "creator",
      text: item.text,
      timeLabel: formatMessageTime(item.createdAt),
    }
  }, [])

  useEffect(() => {
    setThreadId("")
    setInput("")
    setError("")
    setMessages([createWelcomeMessage(creatorId, creatorName)])
    initPromiseRef.current = null
  }, [creatorId, creatorName])

  useEffect(() => {
    if (!open) return
    if (initPromiseRef.current) return

    const initChat = async () => {
      setIsInitializing(true)
      setError("")
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const user = session?.user ?? null
        if (!user) {
          setError("Please sign in to start chatting.")
          return
        }

        const participants = [user.id, creatorId].sort()
        const directOrderId = `direct:${participants[0]}:${participants[1]}`
        const thread = await openOrCreateThread({
          orderId: directOrderId,
          otherUserId: creatorId,
          otherUserName: creatorName,
        })
        setThreadId(thread.id)
        const apiMessages = await fetchThreadMessages(thread.id)
        setMessages(() => {
          if (apiMessages.length === 0) return [createWelcomeMessage(creatorId, creatorName)]
          return apiMessages.map(mapMessage)
        })
      } catch (initError) {
        setError(initError instanceof Error ? initError.message : "Unable to start chat.")
      } finally {
        setIsInitializing(false)
        initPromiseRef.current = null
      }
    }

    initPromiseRef.current = initChat()
  }, [creatorId, creatorName, mapMessage, open, supabase])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || !threadId) return

    setIsSending(true)
    setError("")
    try {
      const sent = await sendThreadMessage(threadId, trimmed)
      setMessages((current) => [...current, mapMessage(sent)])
      setInput("")
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send message.")
    } finally {
      setIsSending(false)
    }
  }

  if (!open) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-90 "
        aria-label="Close chat"
        onClick={() => onOpenChange(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "fixed bottom-4 right-4 z-100 flex h-[min(560px,calc(100vh-2rem))] w-[min(calc(100vw-2rem),420px)] flex-col overflow-hidden",
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
          {isInitializing ? (
            <p className="text-xs text-muted-foreground">Connecting chat...</p>
          ) : null}
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
              disabled={isInitializing || isSending || !threadId}
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0"
              aria-label="Send message"
              disabled={isInitializing || isSending || !threadId || !input.trim()}
            >
              <Send className="size-4" />
            </Button>
          </div>
          {threadId ? (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Continue full conversation in{" "}
              <Link href={`/messages?thread=${encodeURIComponent(threadId)}`} className="underline">
                Messages
              </Link>
              .
            </p>
          ) : null}
          {error ? <p className="mt-1 text-[11px] text-destructive">{error}</p> : null}
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <MessageSquare className="size-3 shrink-0" aria-hidden />
            Messages sync with your shared inbox.
          </p>
        </form>
      </div>
    </>
  )
}
