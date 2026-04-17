"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  CheckCheck,
  Circle,
  ExternalLink,
  ImageIcon,
  MapPin,
  Mic,
  Phone,
  Search,
  Send,
  Sparkles,
  Video,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CreatorMessageThread, creatorMessageThreads } from "@/features/creator/messages/messages-data"
import { cn } from "@/lib/utils"

type ThreadFilter = "all" | "needs_response" | "active" | "waiting" | "closed"

function getStatusTone(status: CreatorMessageThread["status"]) {
  switch (status) {
    case "needs_response":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300"
    case "active":
      return "bg-primary/15 text-primary"
    case "waiting":
      return "bg-muted text-muted-foreground"
    case "closed":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function formatStatusLabel(status: CreatorMessageThread["status"]) {
  return status.replace("_", " ")
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function CreatorMessagesView() {
  const [threads, setThreads] = useState<CreatorMessageThread[]>(creatorMessageThreads)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<ThreadFilter>("all")
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [activeThreadId, setActiveThreadId] = useState<string>(threads[0]?.id ?? "")
  const [composer, setComposer] = useState("")

  const inboxMetrics = useMemo(() => {
    const unread = threads.reduce((total, thread) => total + thread.unreadCount, 0)
    const needsResponse = threads.filter((thread) => thread.status === "needs_response").length
    const active = threads.filter((thread) => thread.status === "active").length
    return { unread, needsResponse, active }
  }, [threads])

  const filteredThreads = useMemo(() => {
    const query = search.trim().toLowerCase()
    return threads.filter((thread) => {
      const matchesFilter = filter === "all" ? true : thread.status === filter
      const matchesUnread = showUnreadOnly ? thread.unreadCount > 0 : true
      const matchesSearch =
        query.length === 0 ||
        thread.buyerName.toLowerCase().includes(query) ||
        thread.orderId.toLowerCase().includes(query) ||
        thread.packageName.toLowerCase().includes(query)
      return matchesFilter && matchesUnread && matchesSearch
    })
  }, [filter, search, showUnreadOnly, threads])

  const activeThread =
    filteredThreads.find((thread) => thread.id === activeThreadId) ??
    filteredThreads[0] ??
    null

  function handleSendMessage() {
    const next = composer.trim()
    if (!next || !activeThread) return

    setThreads((current) =>
      current.map((thread) => {
        if (thread.id !== activeThread.id) return thread
        return {
          ...thread,
          unreadCount: 0,
          status: thread.status === "needs_response" ? "active" : thread.status,
          lastMessageAt: "just now",
          messages: [
            ...thread.messages,
            {
              id: `creator-${crypto.randomUUID()}`,
              sender: "creator",
              text: next,
              time: "Now",
            },
          ],
        }
      })
    )
    setComposer("")
  }

  function markActiveThreadRead() {
    if (!activeThread) return
    setThreads((current) =>
      current.map((thread) => (thread.id === activeThread.id ? { ...thread, unreadCount: 0 } : thread))
    )
  }

  const pinnedThreads = filteredThreads.filter((thread) => thread.status === "needs_response").slice(0, 4)
  const otherThreads = filteredThreads.filter((thread) => !pinnedThreads.some((item) => item.id === thread.id))

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Messages</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Manage buyer communication, prioritize urgent replies, and keep order threads moving.
          </p>
        </div>
      </section>

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle>Creator Inbox</CardTitle>
          <CardDescription>
            Modern split-view messaging inspired by your reference layout, adapted to your theme.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 py-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Unread messages</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{inboxMetrics.unread}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Needs response</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{inboxMetrics.needsResponse}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Active threads</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{inboxMetrics.active}</p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
            <aside className="rounded-2xl border border-border/70 bg-card">
              <div className="space-y-3 border-b border-border/70 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-foreground">Messages</p>
                  <Button
                    type="button"
                    variant={showUnreadOnly ? "default" : "ghost"}
                    size="icon-sm"
                    onClick={() => setShowUnreadOnly((current) => !current)}
                    aria-label="Toggle unread threads"
                  >
                    <Circle className="size-3.5" />
                  </Button>
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search conversation..."
                    className="pl-8"
                  />
                </div>

                <Select value={filter} onValueChange={(value) => setFilter(value as ThreadFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter threads" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All threads</SelectItem>
                    <SelectItem value="needs_response">Needs response</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="max-h-[620px] overflow-auto p-2">
                {filteredThreads.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-4 text-sm text-muted-foreground">
                    No conversations found.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pinnedThreads.length > 0 ? (
                      <div>
                        <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Pinned</p>
                        <div className="space-y-1">
                          {pinnedThreads.map((thread) => (
                            <button
                              key={thread.id}
                              type="button"
                              onClick={() => setActiveThreadId(thread.id)}
                              className={cn(
                                "w-full rounded-xl border p-3 text-left transition-colors",
                                activeThread?.id === thread.id
                                  ? "border-primary/40 bg-primary/5"
                                  : "border-border/60 hover:bg-accent/30"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                                  {initialsFromName(thread.buyerName)}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="truncate text-sm font-medium text-foreground">
                                      {thread.buyerName}
                                    </p>
                                    <span className="text-[11px] text-muted-foreground">
                                      {thread.lastMessageAt}
                                    </span>
                                  </div>
                                  <p className="line-clamp-1 text-xs text-muted-foreground">
                                    {thread.packageName}
                                  </p>
                                </div>
                                {thread.unreadCount > 0 ? (
                                  <Badge className="h-5 min-w-5 justify-center px-1.5">
                                    {thread.unreadCount}
                                  </Badge>
                                ) : null}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div>
                      <p className="px-2 py-1 text-xs font-medium text-muted-foreground">All message</p>
                      <div className="space-y-1">
                        {otherThreads.map((thread) => (
                          <button
                            key={thread.id}
                            type="button"
                            onClick={() => setActiveThreadId(thread.id)}
                            className={cn(
                              "w-full rounded-xl border p-3 text-left transition-colors",
                              activeThread?.id === thread.id
                                ? "border-primary/40 bg-primary/5"
                                : "border-border/60 hover:bg-accent/30"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                                {initialsFromName(thread.buyerName)}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="truncate text-sm font-medium text-foreground">
                                    {thread.buyerName}
                                  </p>
                                  <span className="text-[11px] text-muted-foreground">
                                    {thread.lastMessageAt}
                                  </span>
                                </div>
                                <p className="line-clamp-1 text-xs text-muted-foreground">
                                  {thread.messages.at(-1)?.text ?? thread.packageName}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </aside>

            <section className="rounded-2xl border border-border/70 bg-card">
              {activeThread ? (
                <>
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                        {initialsFromName(activeThread.buyerName)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{activeThread.buyerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {activeThread.orderId} · {activeThread.packageName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={cn("capitalize", getStatusTone(activeThread.status))}>
                        {formatStatusLabel(activeThread.status)}
                      </Badge>
                      <Button type="button" size="icon-sm" variant="ghost" aria-label="Start call">
                        <Phone className="size-4" />
                      </Button>
                      <Button type="button" size="icon-sm" variant="ghost" aria-label="Start video call">
                        <Video className="size-4" />
                      </Button>
                      <Link
                        href={`/dashboard/creator/orders/${activeThread.orderId}`}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                      >
                        Open order
                        <ExternalLink className="size-3" />
                      </Link>
                    </div>
                  </header>

                  <div className="max-h-[450px] space-y-3 overflow-auto bg-muted/20 p-4">
                    <div className="flex justify-center">
                      <span className="rounded-full bg-background px-3 py-1 text-[11px] text-muted-foreground">
                        Today
                      </span>
                    </div>
                    {activeThread.messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "max-w-[88%] rounded-2xl border px-3 py-2",
                          message.sender === "creator"
                            ? "ml-auto border-primary/40 bg-primary/10"
                            : message.sender === "system"
                              ? "mx-auto border-dashed border-border/70 bg-background text-center text-xs"
                              : "border-border/70 bg-background"
                        )}
                      >
                        <p className="text-sm text-foreground">{message.text}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{message.time}</p>
                      </div>
                    ))}
                  </div>

                  <footer className="space-y-3 border-t border-border/70 p-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setComposer("Thanks for the update. I will share the next draft by tomorrow.")
                        }
                      >
                        <Sparkles className="size-3.5" />
                        Quick reply
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={markActiveThreadRead}>
                        <CheckCheck className="size-3.5" />
                        Mark as read
                      </Button>
                      {activeThread.status === "needs_response" ? (
                        <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-300">
                          <Circle className="size-3.5 fill-current" />
                          Buyer waiting
                        </Badge>
                      ) : null}
                    </div>

                    <div className="flex items-end gap-2">
                      <Textarea
                        value={composer}
                        onChange={(event) => setComposer(event.target.value)}
                        placeholder="Type a message..."
                        className="min-h-12 flex-1"
                      />
                      <div className="mb-1 flex items-center gap-1">
                        <Button type="button" size="icon-sm" variant="ghost" aria-label="Attach image">
                          <ImageIcon className="size-4" />
                        </Button>
                        <Button type="button" size="icon-sm" variant="ghost" aria-label="Share location">
                          <MapPin className="size-4" />
                        </Button>
                        <Button type="button" size="icon-sm" variant="ghost" aria-label="Record voice">
                          <Mic className="size-4" />
                        </Button>
                        <Button type="button" onClick={handleSendMessage} aria-label="Send message">
                          <Send className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </footer>
                </>
              ) : (
                <div className="p-6 text-sm text-muted-foreground">Select a conversation to view messages.</div>
              )}
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
