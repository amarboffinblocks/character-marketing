"use client"

import { useEffect, useMemo, useState } from "react"
import { BriefcaseBusiness, CircleCheckBig, CheckCircle2, LoaderCircle, MessageCircle, MoreVertical, Search, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { openOrCreateThread } from "@/features/messaging/api"
import { cn } from "@/lib/utils"

type GlobalBid = {
  id: string
  duration: string
  budget: string
  skillsNeeded: string
  description: string
  title: string
  requesterId: string
  requesterName: string
  requesterEmail: string
  status: string
  isPriceNegotiable: boolean
  createdAt: string
  interestedCount: number
  creatorInterestStatus: string | null
  isOwnBid: boolean
}

const bidTabs = [
  { id: "best-matches", label: "Best Matches" },
  { id: "most-recent", label: "Most Recent" },
  { id: "saved-jobs", label: "Saved Jobs" },
] as const

function formatAddedAgo(value: string) {
  const createdAt = new Date(value)
  if (Number.isNaN(createdAt.getTime())) return "Added recently"
  const diffMs = Date.now() - createdAt.getTime()
  const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)))
  if (diffHours < 24) return `Added ${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
  const diffDays = Math.floor(diffHours / 24)
  return `Added ${diffDays} day${diffDays === 1 ? "" : "s"} ago`
}

function formatBudget(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return "$0"
  return trimmed.startsWith("$") ? trimmed : `$${trimmed}`
}

function formatDuration(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return "—"
  return /day/i.test(trimmed) ? trimmed : `${trimmed} days`
}

export function GlobalBidsView() {
  const router = useRouter()
  const [bids, setBids] = useState<GlobalBid[]>([])
  const [activeTab, setActiveTab] = useState<(typeof bidTabs)[number]["id"]>("best-matches")
  const [query, setQuery] = useState("")
  const [sortBy, setSortBy] = useState("relevance")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [openingChatBidId, setOpeningChatBidId] = useState<string | null>(null)
  const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null)

  const filteredBids = useMemo(() => {
    const q = query.trim().toLowerCase()

    const bySearch = bids.filter((bid) => {
      const matchesQuery =
        q.length === 0 ||
        bid.title.toLowerCase().includes(q) ||
        bid.description.toLowerCase().includes(q) ||
        bid.skillsNeeded.toLowerCase().includes(q) ||
        bid.requesterName.toLowerCase().includes(q)
      return matchesQuery
    })

    return [...bySearch].sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return a.title.localeCompare(b.title)
    })
  }, [bids, query, sortBy])

  useEffect(() => {
    let mounted = true
    async function loadGlobalBids() {
      setLoading(true)
      setError("")
      try {
        const response = await fetch("/api/creator/global-bids", { cache: "no-store" })
        const data = (await response.json()) as { bids?: GlobalBid[]; error?: string }
        if (!response.ok) throw new Error(data.error || "Unable to load global bids.")
        if (mounted) setBids(data.bids ?? [])
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : "Unable to load global bids.")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void loadGlobalBids()
    return () => {
      mounted = false
    }
  }, [])

  async function handleOpenClientChat(bid: GlobalBid) {
    setOpeningChatBidId(bid.id)
    setError("")
    try {
      const thread = await openOrCreateThread({
        orderId: `global-bid:${bid.id}`,
        otherUserId: bid.requesterId,
        otherUserName: bid.requesterName,
      })
      router.push(`/dashboard/creator/inbox?thread=${encodeURIComponent(thread.id)}`)
    } catch (chatError) {
      setError(chatError instanceof Error ? chatError.message : "Unable to open chat.")
    } finally {
      setOpeningChatBidId(null)
    }
  }

  async function handleAcceptBid(bidId: string) {
    setAcceptingBidId(bidId)
    setError("")
    try {
      const response = await fetch(`/api/creator/global-bids/${encodeURIComponent(bidId)}/accept`, {
        method: "POST",
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(data.error || "Unable to accept bid.")
      setBids((current) =>
        current.map((bid) =>
          bid.id === bidId
            ? { ...bid, creatorInterestStatus: "interested", interestedCount: bid.interestedCount + 1 }
            : bid
        )
      )
    } catch (acceptError) {
      setError(acceptError instanceof Error ? acceptError.message : "Unable to accept bid.")
    } finally {
      setAcceptingBidId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Jobs you might like</h1>
        <Tabs value={activeTab} onValueChange={(next) => setActiveTab(next as (typeof bidTabs)[number]["id"])}>
          <div className="flex items-center justify-between gap-2">
            <TabsList variant="line" className="h-auto bg-transparent p-0">
              {bidTabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="h-8 px-3 text-sm">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <p className="text-xs text-muted-foreground">Database records only</p>
          </div>
        </Tabs>
      </div>

      <section className="space-y-4">
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search jobs, skills, clients..."
                  className="pl-9"
              />
              </div>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value ?? "relevance")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">relevance</SelectItem>
                  <SelectItem value="latest">latest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Showing {filteredBids.length} jobs</p>
          </div>

        {error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
            {error}
          </div>
        ) : loading ? (
          <div className="rounded-xl border border-border/70 bg-card p-6 text-sm text-muted-foreground">Loading global bids...</div>
        ) : filteredBids.length === 0 ? (
          <div className="rounded-xl border border-border/70 bg-card p-6 text-sm text-muted-foreground">No global bids found.</div>
        ) : (
          <ul className="space-y-3">
            {filteredBids.map((bid) => (
              <li key={bid.id} className="rounded-xl border border-border/70 bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-primary/80">{formatAddedAgo(bid.createdAt)}</p>
                    <h2 className="flex items-start gap-4 text-xl font-semibold text-foreground">
                      <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <BriefcaseBusiness className="size-5" />
                      </span>
                      <span>{bid.title}</span>
                    </h2>
                    <div className="space-y-3 pl-12">
                      <p className="text-sm flex gap-2 dark:text-violet-300/80">
                        Budget: {formatBudget(bid.budget)} -{" "}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 font-medium",
                            bid.isPriceNegotiable
                              ? "text-emerald-700 dark:text-emerald-300"
                              : "text-red-700 dark:text-red-300"
                          )}
                        >
                          {bid.isPriceNegotiable ? (
                            <CheckCircle2 className="size-4" />
                          ) : (
                            <XCircle className="size-4" />
                          )}
                          {bid.isPriceNegotiable ? "Negotiable" : "Non Negotiable"}
                        </span>
                        {" "} - Est. Time: {formatDuration(bid.duration)}
                      </p>
                      <p className="line-clamp-3 text-sm leading-6 text-foreground/90">{bid.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {bid.skillsNeeded
                          .split(",")
                          .map((skill) => skill.trim())
                          .filter(Boolean)
                          .map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="rounded-full bg-primary/20 text-primary/70 dark:bg-sky-900/30 dark:text-sky-200"
                          >
                            {skill}
                          </Badge>
                          ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="text-foreground font-medium">{bid.requesterName}</span>
                        <span>{bid.requesterEmail || "No email shared"}</span>
                        <span className="text-indigo-700 font-medium text-xs dark:text-indigo-300">
                          Applicants: {bid.interestedCount}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        Status:{" "}
                        <span
                          className={cn(
                            bid.status === "rejected" || bid.status === "completed"
                              ? "text-rose-700 dark:text-rose-300"
                              : "text-emerald-700 dark:text-emerald-300"
                          )}
                        >
                          {bid.status === "rejected" || bid.status === "completed" ? "Closed" : "Open"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button className="bg-primary/10 text-primary/70 hover:bg-primary/20 hover:text-primary" size="icon-sm" aria-label="Bid actions">
                            <MoreVertical className="size-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          disabled={openingChatBidId === bid.id}
                          onClick={() => void handleOpenClientChat(bid)}
                        >
                          {openingChatBidId === bid.id ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <MessageCircle className="size-4" />
                          )}
                          Chat with client
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-emerald-700 focus:bg-emerald-100 focus:text-emerald-800 dark:focus:bg-emerald-500/20 dark:focus:text-emerald-300"
                          disabled={
                            bid.isOwnBid ||
                            acceptingBidId === bid.id ||
                            bid.creatorInterestStatus === "interested"
                          }
                          onClick={() => void handleAcceptBid(bid.id)}
                        >
                          {acceptingBidId === bid.id ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <CircleCheckBig className="size-4" />
                          )}
                          Accept
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
