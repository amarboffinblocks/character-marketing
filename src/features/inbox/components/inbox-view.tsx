"use client"

import Link from "next/link"
import { Bell, BriefcaseBusiness, CreditCard, FolderClock, MessageSquare, RefreshCw, Sparkles, UserCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type InboxCategory, type InboxRole, type InboxTab } from "@/features/inbox/types"
import { useInboxFeed } from "@/features/inbox/use-inbox-feed"
import { cn } from "@/lib/utils"

type InboxViewProps = {
  role: InboxRole
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function categoryMeta(category: InboxCategory) {
  if (category === "message") return { icon: MessageSquare, className: "text-sky-600 bg-sky-500/10 border-sky-500/20" }
  if (category === "request") return { icon: FolderClock, className: "text-amber-600 bg-amber-500/10 border-amber-500/20" }
  if (category === "order") return { icon: BriefcaseBusiness, className: "text-violet-600 bg-violet-500/10 border-violet-500/20" }
  if (category === "bid") return { icon: UserCheck, className: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" }
  if (category === "payment") return { icon: CreditCard, className: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20" }
  return { icon: Sparkles, className: "text-primary bg-primary/10 border-primary/20" }
}

const tabs: Array<{ id: Exclude<InboxTab, "messages">; label: string }> = [
  { id: "all", label: "All" },
  { id: "updates", label: "Updates" },
]

export function InboxView({ role }: InboxViewProps) {
  const {
    filteredItems,
    unreadCount,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    markItemRead,
    markAllRead,
    refresh,
  } = useInboxFeed(role)

  return (
    <main className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", role === "buyer" ? "pt-24 pb-10" : "pt-6 pb-10")}>
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Inbox</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
              Unified updates for conversations and marketplace activity.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 px-2.5 py-1 text-xs">
              {unreadCount} unread
            </Badge>
            <Button variant="outline" size="sm" onClick={() => void refresh()}>
              <RefreshCw className="size-4" />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
              Mark all read
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as InboxTab)}>
          <TabsList className="h-10 rounded-xl border border-border/70 bg-card p-1">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="rounded-lg px-3 text-xs sm:text-sm">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </section>

      <section className="mt-4 space-y-3">
        {isLoading ? (
          <Card className="rounded-2xl border-border/70 p-6 text-sm text-muted-foreground">Loading inbox…</Card>
        ) : null}
        {error ? (
          <Card className="rounded-2xl border-rose-500/40 bg-rose-500/5 p-4 text-sm text-rose-700">
            {error}
          </Card>
        ) : null}
        {!isLoading && filteredItems.length === 0 ? (
          <Card className="rounded-2xl border-border/70 p-8 text-center">
            <span className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bell className="size-6" />
            </span>
            <h2 className="mt-3 text-base font-semibold text-foreground">Inbox is clear</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              New chat and activity updates will appear here.
            </p>
          </Card>
        ) : null}

        {!isLoading
          ? filteredItems.map((item) => {
              const meta = categoryMeta(item.category)
              const Icon = meta.icon
              return (
                <Link
                  key={item.id}
                  href={item.actionUrl}
                  onClick={() => markItemRead(item.id)}
                  className={cn(
                    "block rounded-2xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-px hover:shadow-md",
                    item.isRead ? "border-border/70" : "border-primary/30 ring-1 ring-primary/15"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-lg border", meta.className)}>
                      <Icon className="size-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                        <span className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.body}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="h-5 px-2 text-[10px] uppercase tracking-wide">
                          {item.type}
                        </Badge>
                        <Badge variant="outline" className="h-5 px-2 text-[10px] uppercase tracking-wide">
                          {item.category}
                        </Badge>
                        {!item.isRead ? (
                          <span className="inline-flex size-2 rounded-full bg-primary" aria-label="Unread item" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })
          : null}
      </section>
    </main>
  )
}
