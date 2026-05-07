"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { BadgeCheck, CheckCheck, FileText, Menu, MessageSquare, MoreVertical, Search, Send, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  clearThreadMessages,
  fetchMessageThreads,
  fetchThreadMessages,
  markThreadRead,
  openOrCreateThread,
  sendThreadMessage,
} from "@/features/messaging/api"
import { formatMessageDateTime, formatMessageTime, type MessageItem, type MessageThread } from "@/features/messaging/types"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type CreatorMessagesViewProps = {
  viewerRole?: "creator" | "buyer" | "admin"
}

export function CreatorMessagesView({ viewerRole = "creator" }: CreatorMessagesViewProps) {
  type TypingChannel = { send: (message: unknown) => Promise<unknown> | unknown }
  type MessageInsertPayload = {
    new?: {
      id?: string
      thread_id?: string
      sender_id?: string
      sender_role?: MessageItem["senderRole"]
      body?: string
      created_at?: string
    }
  }
  type TypingPayload = {
    threadId?: string
    senderRole?: "creator" | "buyer" | "admin"
    isTyping?: boolean
  }
  const searchParams = useSearchParams()
  const threadParam = searchParams.get("thread")?.trim() ?? ""
  const orderParam = searchParams.get("order")?.trim() ?? ""
  const targetParam = searchParams.get("target")?.trim() ?? ""
  const supabase = useMemo(() => createClientSupabaseClient(), [])

  const [threads, setThreads] = useState<MessageThread[]>([])
  const [activeThreadId, setActiveThreadId] = useState("")
  const [userId, setUserId] = useState("")
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [search, setSearch] = useState("")
  const [composer, setComposer] = useState("")
  const [isLoadingThreads, setIsLoadingThreads] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [error, setError] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isCounterpartTyping, setIsCounterpartTyping] = useState(false)
  const counterpartTypingTimeoutRef = useRef<number | null>(null)
  const lastTypingSentAtRef = useRef<number>(0)
  const previousActiveThreadIdRef = useRef<string>("")
  const threadsLoadSeqRef = useRef(0)
  const messagesLoadSeqRef = useRef(0)
  const currentUserSenderRole = viewerRole === "admin" ? "admin" : viewerRole === "creator" ? "creator" : "buyer"
  const typingChannelRef = useRef<TypingChannel | null>(null)
  const activeThreadIdRef = useRef("")
  const currentUserSenderRoleRef = useRef<"creator" | "buyer" | "admin">(currentUserSenderRole)

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) setUserId(data.user.id)
    }
    fetchUser()
  }, [supabase])

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, activeThreadId])

  useEffect(() => {
    activeThreadIdRef.current = activeThreadId
  }, [activeThreadId])

  useEffect(() => {
    currentUserSenderRoleRef.current = currentUserSenderRole
  }, [currentUserSenderRole])

  const loadThreads = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false
    const seq = ++threadsLoadSeqRef.current
    if (!silent) {
      setIsLoadingThreads(true)
    }
    setError("")
    try {
      let items = await fetchMessageThreads({ orderId: orderParam || undefined })

      if (viewerRole === "admin" && orderParam && targetParam) {
        const hasSpecificThread = items.some(
          (item) =>
            (item.creatorId === userId && item.buyerId === targetParam) ||
            (item.buyerId === userId && item.creatorId === targetParam)
        )
        if (!hasSpecificThread) {
          try {
            const thread = await openOrCreateThread({ 
              orderId: orderParam,
              otherUserId: targetParam
            })
            items = [thread, ...items]
          } catch (e) {
            console.error("Failed to open/create admin private thread:", e)
          }
        }
      }

      if (seq !== threadsLoadSeqRef.current) return
      setThreads(items)
      if (threadParam && items.some((item) => item.id === threadParam)) {
        setActiveThreadId(threadParam)
      } else if (targetParam) {
        // Prioritize the private thread where the admin is chatting directly with the target
        const privateThread = items.find(
          (item) =>
            (item.creatorId === userId && item.buyerId === targetParam) ||
            (item.buyerId === userId && item.creatorId === targetParam)
        )
        const anyMatchingThread = items.find(
          (item) => item.buyerId === targetParam || item.creatorId === targetParam
        )
        setActiveThreadId(privateThread?.id ?? anyMatchingThread?.id ?? items[0]?.id ?? "")
      } else if (!items.some((item) => item.id === activeThreadId)) {
        setActiveThreadId(items[0]?.id ?? "")
      }
    } catch (loadError) {
      if (seq === threadsLoadSeqRef.current) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load message threads.")
      }
    } finally {
      if (!silent && seq === threadsLoadSeqRef.current) setIsLoadingThreads(false)
    }
  }, [activeThreadId, orderParam, targetParam, threadParam, userId, viewerRole])

  const loadMessages = useCallback(async (threadId: string, silent = false) => {
    if (!threadId) return
    const seq = ++messagesLoadSeqRef.current
    if (!silent) setIsLoadingMessages(true)
    try {
      const items = await fetchThreadMessages(threadId)
      if (seq === messagesLoadSeqRef.current) {
        setMessages(items)
      }
      await markThreadRead(threadId)
    } catch (loadError) {
      if (seq === messagesLoadSeqRef.current) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load messages.")
      }
    } finally {
      if (!silent && seq === messagesLoadSeqRef.current) setIsLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    if (targetParam && !userId) return
    void loadThreads()
  }, [loadThreads, userId, targetParam])

  useEffect(() => {
    if (!activeThreadId) return
    // Optimistically clear unread immediately for the active thread.
    setThreads((current) =>
      current.map((t) => (t.id === activeThreadId ? { ...t, unreadCount: 0, status: "active" } : t))
    )

    void (async () => {
      try {
        await loadMessages(activeThreadId)
      } finally {
        // Always resync threads after attempting mark-read.
        await loadThreads({ silent: true })
      }
    })()
  }, [activeThreadId, loadMessages, loadThreads])

  useEffect(() => {
    if (viewerRole === "admin") return

    const channel = supabase
      .channel(`conversation-messages-${viewerRole}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversation_messages" }, (payload: MessageInsertPayload) => {
        const newRow = payload.new as {
          id?: string
          thread_id?: string
          sender_id?: string
          sender_role?: MessageItem["senderRole"]
          body?: string
          created_at?: string
        }
        const threadId = newRow.thread_id ?? ""
        if (!threadId) return

        if (threadId === activeThreadId) {
          // Stream the new incoming message instantly without waiting for a full messages reload.
          const messageId = newRow.id
          if (messageId) {
            const nextMessage: MessageItem = {
              id: messageId,
              threadId,
              senderId: newRow.sender_id ?? "",
              senderRole: newRow.sender_role ?? "buyer",
              text: newRow.body ?? "",
              createdAt: newRow.created_at ?? new Date().toISOString(),
            }

            setMessages((current) => {
              if (current.some((m) => m.id === messageId)) return current
              const next = [...current, nextMessage]
              next.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              return next
            })

            setThreads((current) =>
              current.map((t) =>
                t.id === threadId
                  ? {
                    ...t,
                    unreadCount: 0,
                    status: "active",
                    lastMessageText: nextMessage.text,
                    lastMessageAt: nextMessage.createdAt,
                  }
                  : t
              )
            )
          }

          // Mark as read (server truth), then update unread counts.
          void (async () => {
            try {
              await markThreadRead(threadId)
            } finally {
              await loadThreads({ silent: true })
            }
          })().catch(() => { })
        } else {
          void loadThreads({ silent: true })
        }
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [activeThreadId, loadMessages, loadThreads, supabase, viewerRole])

  // Typing indicator (WhatsApp-like) over Supabase realtime "broadcast" events.
  useEffect(() => {
    if (viewerRole === "admin") return

    const typingChannel = supabase
      .channel("conversation-typing")
      .on("broadcast", { event: "typing" }, (payload: TypingPayload) => {
        const data = payload

        const activeId = activeThreadIdRef.current
        const myRole = currentUserSenderRoleRef.current

        if (!data?.threadId || data.threadId !== activeId) return
        if (!data?.senderRole) return
        if (data.senderRole === myRole) return

        const isTyping = data.isTyping ?? true
        if (!isTyping) {
          setIsCounterpartTyping(false)
          if (counterpartTypingTimeoutRef.current) {
            window.clearTimeout(counterpartTypingTimeoutRef.current)
            counterpartTypingTimeoutRef.current = null
          }
          return
        }

        setIsCounterpartTyping(true)
        if (counterpartTypingTimeoutRef.current) window.clearTimeout(counterpartTypingTimeoutRef.current)
        counterpartTypingTimeoutRef.current = window.setTimeout(() => {
          setIsCounterpartTyping(false)
        }, 2500)
      })
      .subscribe()

    typingChannelRef.current = typingChannel as unknown as TypingChannel

    return () => {
      if (counterpartTypingTimeoutRef.current) {
        window.clearTimeout(counterpartTypingTimeoutRef.current)
        counterpartTypingTimeoutRef.current = null
      }
      typingChannelRef.current = null
      void supabase.removeChannel(typingChannel)
    }
  }, [supabase, viewerRole])

  useEffect(() => {
    if (viewerRole !== "admin") return
    const intervalId = window.setInterval(() => {
      void loadThreads({ silent: true })
      if (activeThreadIdRef.current) {
        void loadMessages(activeThreadIdRef.current, true)
      }
    }, 5000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [loadMessages, loadThreads, viewerRole])

  const filteredThreads = useMemo(() => {
    const query = search.trim().toLowerCase()
    return threads.filter((thread) => {
      if (query.length === 0) return true
      return thread.counterpartName.toLowerCase().includes(query) || thread.orderId.toLowerCase().includes(query)
    })
  }, [search, threads])

  const activeThread = useMemo(() => {
    return threads.find((t) => t.id === activeThreadId) || null
  }, [threads, activeThreadId])

  const emitTypingForThread = useCallback(
    (threadId: string, isTyping: boolean) => {
      if (!threadId) return
      const now = Date.now()
      // Throttle only "typing=true" broadcasts to avoid spam.
      if (isTyping && now - lastTypingSentAtRef.current < 900) return

      lastTypingSentAtRef.current = now

      const channel = (typingChannelRef.current ??
        (supabase.channel("conversation-typing") as unknown as TypingChannel)) as TypingChannel
      Promise.resolve(
        channel.send({
          type: "broadcast",
          event: "typing",
          payload: {
            threadId,
            senderRole: currentUserSenderRole,
            isTyping,
          },
        })
      )
        .catch(() => { })
    },
    [currentUserSenderRole, supabase]
  )

  const emitTyping = useCallback(
    (isTyping: boolean) => emitTypingForThread(activeThreadId, isTyping),
    [activeThreadId, emitTypingForThread]
  )

  useEffect(() => {
    const previousThreadId = previousActiveThreadIdRef.current
    if (previousThreadId && previousThreadId !== activeThreadId) {
      // Stop typing on the old thread immediately when the user switches threads.
      emitTypingForThread(previousThreadId, false)
    }

    if (activeThreadId) {
      // Ensure we don't leave a stale typing state on the currently open thread.
      emitTypingForThread(activeThreadId, false)
    }

    setIsCounterpartTyping(false)
    previousActiveThreadIdRef.current = activeThreadId
  }, [activeThreadId, emitTypingForThread])

  useEffect(() => {
    return () => {
      const threadId = previousActiveThreadIdRef.current
      if (threadId) emitTypingForThread(threadId, false)
    }
  }, [emitTypingForThread])

  const handleSendMessage = async () => {
    if (!composer.trim() || !activeThread) return
    setIsSending(true)
    setError("")
    try {
      const message = await sendThreadMessage(activeThread.id, composer.trim())
      setMessages((current) => {
        if (current.some((m) => m.id === message.id)) return current
        const next = [...current, message]
        next.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        return next
      })
      setComposer("")
      emitTyping(false)
      await loadThreads({ silent: true })
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send message.")
    } finally {
      setIsSending(false)
    }
  }

  const handleClearChat = async () => {
    if (!activeThread) return
    setIsClearing(true)
    try {
      setError("")
      await clearThreadMessages(activeThread.id)
      setMessages([])
      emitTyping(false)
      await loadThreads({ silent: true })
      setIsClearDialogOpen(false)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to clear chat.")
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-0 overflow-hidden rounded-2xl border border-border/60 bg-background/50">
        <div className="relative flex h-full min-h-0 w-full overflow-hidden">
          {/* Mobile Backdrop */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 z-40  lg:hidden"
              />
            )}
          </AnimatePresence>

          <aside className={cn(
            "flex min-h-0 h-full flex-col border-r border-border/40 bg-muted/5 lg:w-[380px] shrink-0 transition-all",
            "absolute inset-y-0 left-0 z-50 bg-background lg:relative lg:translate-x-0",
            activeThreadId 
              ? (isSidebarOpen ? "translate-x-0 w-[85%] sm:w-80 shadow-2xl" : "-translate-x-full w-[85%] sm:w-80") 
              : "translate-x-0 w-full"
          )}>
            <div className="p-6 pb-2">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h2 className="text-lg font-bold text-foreground/80">Messages</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-8 rounded-full" 
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <X className="size-5" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="h-11 border-border/40 bg-background/50 pl-10 focus:ring-primary/20"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="scrollbar-thin min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-6 pt-2">
              {isLoadingThreads ? (
                <div className="p-4 text-sm text-muted-foreground">Loading conversations…</div>
              ) : filteredThreads.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  {orderParam ? `No conversation found for order ${orderParam}.` : "No conversations yet."}
                </div>
              ) : (
                <AnimatePresence mode="popLayout" initial={false}>
                  {filteredThreads.map((thread) => (
                    <motion.button
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={thread.id}
                      onClick={() => {
                        setActiveThreadId(thread.id)
                        setIsSidebarOpen(false)
                      }}
                      className={cn(
                        "flex w-full items-start gap-4 rounded-2xl p-4 text-left transition-colors hover:bg-accent/35",
                        activeThreadId === thread.id ? "bg-accent ring-1 ring-border/60" : "bg-transparent"
                      )}
                    >
                      <div className="relative shrink-0">
                        {thread.isCounterpartAdmin ? (
                          <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl bg-white/50 p-1.5 shadow-md ring-1 ring-border/40">
                            <img 
                              src={thread.counterpartAvatarUrl || ""} 
                              alt="" 
                              className="size-full object-contain" 
                            />
                          </div>
                        ) : (
                          <Avatar className="size-12 shadow-md">
                            <AvatarImage src={thread.counterpartAvatarUrl || undefined} />
                            <AvatarFallback className="bg-primary/10 font-bold text-primary">
                              {thread.counterpartName[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {thread.status === "needs_response" ? (
                          <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-background " />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="truncate font-semibold text-foreground/70">{thread.counterpartName}</span>
                            {thread.isCounterpartAdmin && (
                              <BadgeCheck className="size-3.5 fill-blue-500 text-white" />
                            )}
                          </div>
                          <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                            {formatMessageDateTime(thread.lastMessageAt)}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <p
                            className={cn(
                              "flex-1 truncate text-xs text-muted-foreground",
                              thread.unreadCount > 0 && "font-semibold text-foreground"
                            )}
                          >
                            {thread.lastMessageText}
                          </p>
                          {thread.unreadCount > 0 ? (
                            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                              {thread.unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </aside>

          <main className={cn(
            "flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background/20 transition-all",
            activeThreadId ? "flex" : "hidden lg:flex"
          )}>
            {activeThread ? (
              <>
                <header className="flex h-16 items-center justify-between border-b border-border/40 bg-background/60 px-6 py-4 backdrop-blur-md">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden -ml-2"
                      onClick={() => setIsSidebarOpen(true)}
                    >
                      <Menu className="size-5" />
                    </Button>

                    <div className="relative">
                      {activeThread.isCounterpartAdmin ? (
                        <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl bg-white/50 p-1.5 shadow-sm ring-1 ring-border/40">
                          <img 
                            src={activeThread.counterpartAvatarUrl || ""} 
                            alt="" 
                            className="size-full object-contain" 
                          />
                        </div>
                      ) : (
                        <Avatar className="size-12 shadow-sm">
                          <AvatarImage src={activeThread.counterpartAvatarUrl || undefined} />
                          <AvatarFallback>{activeThread.counterpartName[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-green-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold leading-none text-foreground/80">{activeThread.counterpartName}</h2>
                        {activeThread.isCounterpartAdmin && (
                          <BadgeCheck className="size-4.5 fill-blue-500 text-white" />
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {activeThread.isCounterpartAdmin 
                            ? "Admin conversation"
                            : viewerRole === "admin" 
                              ? `Private chat with ${activeThread.counterpartName}`
                              : viewerRole === "creator" 
                                ? "Buyer conversation" 
                                : "Creator conversation"}
                        </span>
                      </div>
                      {isCounterpartTyping ? (
                        <div className="mt-1 inline-flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden />
                          <span className="font-medium">Typing…</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Chat actions">
                          <MoreVertical className="size-5 text-muted-foreground" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="min-w-40">
                      <DropdownMenuItem onClick={() => setIsClearDialogOpen(true)}>Clear chat</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </header>

                <div ref={scrollRef} className="scrollbar-thin min-h-0 flex-1 space-y-5 overflow-y-auto bg-muted/10 p-6">
                  <div className="my-4 flex justify-center">
                    <span className="rounded-full bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
                      Today
                    </span>
                  </div>

                  {isLoadingMessages ? (
                    <div className="text-sm text-muted-foreground">Loading messages...</div>
                  ) : (
                    messages.map((message) => {
                      const isMine = message.senderRole === currentUserSenderRole
                      return (
                        <div key={message.id} className={cn("flex w-full group", isMine ? "justify-end" : "justify-start")}>
                          <div className={cn("flex max-w-[70%] items-end gap-3", isMine && "flex-row-reverse")}>
                            <div className="space-y-1">
                              <div
                                className={cn(
                                  "relative flex flex-col gap-1 px-4 py-3 ",
                                  isMine
                                    ? "rounded-2xl rounded-tr-sm bg-primary text-primary-foreground"
                                    : "rounded-2xl rounded-tl-sm border border-border/60 bg-accent text-foreground"
                                )}
                              >
                                {message.text.includes(".pdf") ? (
                                  <div className="flex cursor-pointer items-center gap-3 rounded-lg bg-black/10 p-2 transition-colors hover:bg-black/20">
                                    <div className="flex size-10 items-center justify-center rounded-md  text-white">
                                      <FileText className="size-5" />
                                    </div>
                                    <div className="pr-4">
                                      <p className="text-xs font-bold leading-none">{message.text.split("\n")[0]}</p>
                                    </div>
                                    <div
                                      className={cn(
                                        "mt-auto flex items-center justify-end gap-1 whitespace-nowrap leading-none opacity-80",
                                        isMine ? "text-primary-foreground/80" : "text-muted-foreground"
                                      )}
                                    >
                                      <span className="text-[11px] font-medium tabular-nums">{formatMessageTime(message.createdAt)}</span>
                                      {isMine ? <CheckCheck className="size-3" /> : null}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex gap-2">

                                    <p className="whitespace-pre-wrap text-sm leading-relaxed ">{message.text}</p>
                                    <div
                                      className={cn(
                                        "mt-auto flex items-center justify-end gap-1 whitespace-nowrap leading-none opacity-80",
                                        isMine ? "text-primary-foreground/80" : "text-muted-foreground"
                                      )}
                                    >
                                      <span className="text-[11px] font-medium tabular-nums">{formatMessageTime(message.createdAt)}</span>
                                      {isMine ? <CheckCheck className="size-3" /> : null}
                                    </div>
                                  </div>
                                )}

                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  {error ? <div className="text-center text-xs text-destructive">{error}</div> : null}
                </div>

                <footer className="shrink-0 border-t border-border/40 bg-background/60 p-4 backdrop-blur">
                  <div className="mx-auto w-full">
                    <div className="ring-offset-background flex items-end gap-2 rounded-2xl border border-border/60 bg-background/85 p-2 pl-4 transition-all group-within:ring-2 group-within:ring-primary/20">
                      <Textarea
                        placeholder="Type a message..."
                        className="min-h-[46px] max-h-28 flex-1 resize-none border-none bg-transparent px-0 py-2 text-sm shadow-none focus-visible:ring-0"
                        value={composer}
                        disabled={isSending}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault()
                            void handleSendMessage()
                          }
                        }}
                        onChange={(event) => {
                          const next = event.target.value
                          setComposer(next)
                          emitTyping(next.trim().length > 0)
                        }}
                      />
                      <div className="mb-1 shrink-0">
                        <Button
                          onClick={() => void handleSendMessage()}
                          size="icon"
                          disabled={isSending || !composer.trim()}
                          className="size-11 rounded-xl bg-primary text-primary-foreground transition-all active:scale-95"
                          aria-label="Send message"
                        >
                          <Send className="size-5" />
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Press <span className="font-medium">Enter</span> to send, <span className="font-medium">Shift+Enter</span> for a new line.
                    </p>
                  </div>
                </footer>
              </>
            ) : (
              <div className="flex min-h-0 flex-1 items-center justify-center p-8 text-center">
                <Card className="w-full max-w-sm p-6" size="default">
                  <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-primary/5">
                    <MessageSquare className="size-10 text-primary/40" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold">Select a conversation</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choose a thread from the left panel to view full message history and details.
                  </p>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>

      <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Clear chat?</DialogTitle>
            <DialogDescription>
              This will remove all messages from this conversation. The user/contact will still remain in your chat list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsClearDialogOpen(false)} disabled={isClearing}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={() => void handleClearChat()} disabled={isClearing}>
              {isClearing ? "Clearing..." : "Clear chat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
