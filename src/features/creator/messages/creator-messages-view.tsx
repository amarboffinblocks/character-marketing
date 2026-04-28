"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCheck, FileText, MessageSquare, MoreVertical, Search, Send } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  clearThreadMessages,
  deleteThread,
  fetchMessageThreads,
  fetchThreadMessages,
  markThreadRead,
  sendThreadMessage,
} from "@/features/messaging/api"
import { formatMessageDateTime, formatMessageTime, type MessageItem, type MessageThread } from "@/features/messaging/types"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type CreatorMessagesViewProps = {
  viewerRole?: "creator" | "buyer"
}

export function CreatorMessagesView({ viewerRole = "creator" }: CreatorMessagesViewProps) {
  const searchParams = useSearchParams()
  const threadParam = searchParams.get("thread")?.trim() ?? ""
  const orderParam = searchParams.get("order")?.trim() ?? ""
  const supabase = useMemo(() => createClientSupabaseClient(), [])

  const [threads, setThreads] = useState<MessageThread[]>([])
  const [activeThreadId, setActiveThreadId] = useState("")
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [search, setSearch] = useState("")
  const [composer, setComposer] = useState("")
  const [isLoadingThreads, setIsLoadingThreads] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, activeThreadId])

  const loadThreads = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false
    if (!silent) {
      setIsLoadingThreads(true)
    }
    setError("")
    try {
      const items = await fetchMessageThreads({ orderId: orderParam || undefined })
      setThreads(items)
      if (threadParam && items.some((item) => item.id === threadParam)) {
        setActiveThreadId(threadParam)
      } else if (!items.some((item) => item.id === activeThreadId)) {
        setActiveThreadId(items[0]?.id ?? "")
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load message threads.")
    } finally {
      if (!silent) {
        setIsLoadingThreads(false)
      }
    }
  }, [activeThreadId, orderParam, threadParam])

  const loadMessages = useCallback(async (threadId: string, silent = false) => {
    if (!threadId) return
    if (!silent) setIsLoadingMessages(true)
    try {
      const items = await fetchThreadMessages(threadId)
      setMessages(items)
      await markThreadRead(threadId)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load messages.")
    } finally {
      if (!silent) setIsLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    void loadThreads()
  }, [loadThreads])

  useEffect(() => {
    if (!activeThreadId) return
    void loadMessages(activeThreadId)
  }, [activeThreadId, loadMessages])

  useEffect(() => {
    const channel = supabase
      .channel(`conversation-messages-${viewerRole}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversation_messages" }, (payload) => {
        const threadId = (payload.new as { thread_id?: string }).thread_id ?? ""
        void loadThreads({ silent: true })
        if (threadId && threadId === activeThreadId) {
          void loadMessages(threadId, true)
        }
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [activeThreadId, loadMessages, loadThreads, supabase, viewerRole])

  const filteredThreads = useMemo(() => {
    const query = search.trim().toLowerCase()
    return threads.filter((thread) => {
      if (query.length === 0) return true
      return thread.counterpartName.toLowerCase().includes(query) || thread.orderId.toLowerCase().includes(query)
    })
  }, [search, threads])

  const activeThread = threads.find((thread) => thread.id === activeThreadId) ?? null
  const currentUserSenderRole = viewerRole === "creator" ? "creator" : "buyer"

  const handleSendMessage = async () => {
    if (!composer.trim() || !activeThread) return
    setIsSending(true)
    setError("")
    try {
      const message = await sendThreadMessage(activeThread.id, composer.trim())
      setMessages((current) => [...current, message])
      setComposer("")
      await loadThreads({ silent: true })
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send message.")
    } finally {
      setIsSending(false)
    }
  }

  const handleClearChat = async () => {
    if (!activeThread) return
    if (!window.confirm("Clear all messages in this chat?")) return
    try {
      setError("")
      await clearThreadMessages(activeThread.id)
      setMessages([])
      await loadThreads({ silent: true })
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to clear chat.")
    }
  }

  const handleDeleteChat = async () => {
    if (!activeThread) return
    if (!window.confirm("Delete this chat? This removes this conversation from your inbox.")) return
    try {
      setError("")
      await deleteThread(activeThread.id)
      setMessages([])
      setActiveThreadId("")
      await loadThreads({ silent: true })
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to delete chat.")
    }
  }

  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-48px)] flex-1 overflow-hidden rounded-3xl border border-border/60 bg-background/50">
        <div className="flex flex-1 overflow-hidden">
          <aside className="flex w-full flex-col border-r border-border/40 bg-muted/5 sm:w-[380px]">
            <div className="p-6 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search here..."
                  className="h-11 border-border/40 bg-background/50 pl-10 focus:ring-primary/20"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-2 pb-6 pt-2">
              {isLoadingThreads ? (
                <div className="p-4 text-sm text-muted-foreground">Loading conversations...</div>
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
                      onClick={() => setActiveThreadId(thread.id)}
                      className={cn(
                        "flex w-full items-start gap-4 rounded-2xl p-4 text-left transition-all hover:bg-accent/40",
                        activeThreadId === thread.id ? "bg-accent shadow-sm" : "transparent"
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="size-12 shadow-md">
                          <AvatarImage src={`https://i.pravatar.cc/150?u=${thread.counterpartName}`} />
                          <AvatarFallback className="bg-primary/10 font-bold text-primary">
                            {thread.counterpartName[0]}
                          </AvatarFallback>
                        </Avatar>
                        {thread.status === "needs_response" ? (
                          <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-background bg-red-500" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-semibold text-foreground/70">{thread.counterpartName}</span>
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

          <main className="flex flex-1 flex-col bg-background/30">
            {activeThread ? (
              <>
                <header className="flex h-[88px] items-center justify-between border-b border-border/40 px-8 py-4 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="size-12 shadow-sm">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${activeThread.counterpartName}`} />
                        <AvatarFallback>{activeThread.counterpartName[0]}</AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-green-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold leading-none text-foreground/80">{activeThread.counterpartName}</h2>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {viewerRole === "creator" ? "Buyer conversation" : "Creator conversation"}
                        </span>
                        <Badge variant="outline" className="h-4 px-1 text-[10px] opacity-60">
                          {activeThread.orderId}
                        </Badge>
                      </div>
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
                      <DropdownMenuItem onClick={() => void handleClearChat()}>Clear chat</DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => void handleDeleteChat()}>
                        Delete chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </header>

                <div
                  ref={scrollRef}
                  className="scrollbar-thin flex-1 space-y-6 overflow-y-auto bg-black/5 p-8 dark:bg-white/5"
                >
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
                              {!isMine ? (
                                <p className="ml-1 text-[11px] font-semibold text-muted-foreground">{activeThread.counterpartName}</p>
                              ) : null}
                              <div
                                className={cn(
                                  "relative px-4 py-3 shadow-sm",
                                  isMine
                                    ? "rounded-2xl rounded-tr-none bg-primary text-primary-foreground"
                                    : "rounded-2xl rounded-tl-none border border-border/40 bg-background text-foreground"
                                )}
                              >
                                {message.text.includes(".pdf") ? (
                                  <div className="flex cursor-pointer items-center gap-3 rounded-lg bg-black/10 p-2 transition-colors hover:bg-black/20">
                                    <div className="flex size-10 items-center justify-center rounded-md bg-red-500 text-white">
                                      <FileText className="size-5" />
                                    </div>
                                    <div className="pr-4">
                                      <p className="text-xs font-bold leading-none">{message.text.split("\n")[0]}</p>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
                                )}
                                <div
                                  className={cn(
                                    "mt-2 flex items-center justify-end gap-1 opacity-60",
                                    isMine ? "text-primary-foreground/80" : "text-muted-foreground"
                                  )}
                                >
                                  <span className="text-[10px] font-medium">{formatMessageTime(message.createdAt)}</span>
                                  {isMine ? <CheckCheck className="size-3" /> : null}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  {error ? <div className="text-center text-xs text-destructive">{error}</div> : null}
                </div>

                <footer className="bg-background/40 p-6">
                  <div className="group relative mx-auto w-full">
                    <div className="ring-offset-background flex items-center gap-2 rounded-2xl border border-border/60 bg-background/80 p-2 pl-4 transition-all group-within:ring-2 group-within:ring-primary/20">
                      <Input
                        placeholder="Type message..."
                        className="h-12 flex-1 border-none bg-transparent text-sm shadow-none focus-visible:ring-0"
                        value={composer}
                        disabled={isSending}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault()
                            void handleSendMessage()
                          }
                        }}
                        onChange={(event) => setComposer(event.target.value)}
                      />
                      <div className="shrink-0 border-l border-border/40 px-2">
                        <Button
                          onClick={() => void handleSendMessage()}
                          size="icon"
                          disabled={isSending || !composer.trim()}
                          className="ml-2 size-11 rounded-xl bg-primary text-primary-foreground transition-all active:scale-95"
                        >
                          <Send className="size-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </footer>
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center">
                <div className="max-w-sm space-y-4">
                  <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-primary/5">
                    <MessageSquare className="size-10 text-primary/40" />
                  </div>
                  <h3 className="text-xl font-bold">Pick up where you left off</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a conversation from the sidebar to view messages and details about your active orders.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
