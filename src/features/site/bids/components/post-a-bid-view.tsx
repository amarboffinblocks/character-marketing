"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  BriefcaseBusiness,
  CalendarClock,
  Eye,
  LoaderCircle,
  MoreVertical,
  PencilLine,
  PlusCircle,
  Search,
  Trash2,
  Users,
  Wrench,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  bidTabLabels,
  type BidListTab,
  type BidStatus,
} from "@/features/site/bids/types"
import { cn } from "@/lib/utils"

const statusBadgeClassByStatus: Record<BidStatus, string> = {
  global_bid: "bg-emerald-100 text-emerald-700",
  pending: "bg-rose-100 text-rose-700",
  processing: "bg-purple-100 text-purple-700",
  completed: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
}

function visibilityLabelFromStatus(status: BidStatus) {
  return status === "global_bid" ? "Open" : "Closed"
}

export function PostABidView() {
  const [bids, setBids] = useState<import("@/features/site/bids/types").BidItem[]>([])
  const [search, setSearch] = useState("")
  const [statusTab, setStatusTab] = useState<BidListTab>("all")
  const [sort, setSort] = useState("latest")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [assigningBidId, setAssigningBidId] = useState<string | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)

  useEffect(() => {
    let mounted = true
    async function loadBids() {
      setLoading(true)
      setError("")
      try {
        const response = await fetch("/api/site/bids", { cache: "no-store" })
        const data = (await response.json()) as { bids?: import("@/features/site/bids/types").BidItem[]; error?: string }
        if (!response.ok) throw new Error(data.error || "Unable to load bids.")
        if (mounted) setBids(data.bids ?? [])
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : "Unable to load bids.")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void loadBids()
    return () => {
      mounted = false
    }
  }, [])

  const filteredBids = useMemo<import("@/features/site/bids/types").BidItem[]>(() => {
    const query = search.trim().toLowerCase()
    const bySearch = bids.filter((bid) => {
      if (!query) return true
      return bid.title.toLowerCase().includes(query) || bid.skillsNeeded.toLowerCase().includes(query)
    })

    const byStatus = bySearch.filter((bid) => (statusTab === "all" ? true : bid.status === statusTab))

    return [...byStatus].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [bids, search, sort, statusTab])

  const totalInterested = bids.reduce((sum, bid) => sum + bid.interestedCount, 0)
  const activeWorkers = bids.filter((bid) => Boolean(bid.assignedCreator)).length
  const uniqueInterested = Array.from(
    new Map(
      bids
        .flatMap((bid) => bid.interestedCreators)
        .map((creator) => [creator.id, creator] as const)
    ).values()
  )

  async function handleDeleteBid(bidId: string) {
    const confirmed = window.confirm("Delete this bid?")
    if (!confirmed) return
    try {
      setError("")
      const response = await fetch(`/api/site/bids/${encodeURIComponent(bidId)}`, { method: "DELETE" })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(data.error || "Unable to delete bid.")
      setBids((current) => current.filter((bid) => bid.id !== bidId))
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete bid.")
    }
  }

  async function handleAssignCreator(bidId: string, creatorId: string) {
    setIsAssigning(true)
    setError("")
    try {
      const response = await fetch(`/api/site/bids/${encodeURIComponent(bidId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedCreatorId: creatorId }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(data.error || "Unable to assign creator.")
      setBids((current) =>
        current.map((bid) => {
          if (bid.id !== bidId) return bid
          const assigned = bid.interestedCreators.find((creator) => creator.id === creatorId) ?? bid.assignedCreator
          return {
            ...bid,
            status: "processing",
            assignedCreator: assigned ?? null,
          }
        })
      )
      setAssigningBidId(null)
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : "Unable to assign creator.")
    } finally {
      setIsAssigning(false)
    }
  }

  async function handleToggleVisibility(bid: import("@/features/site/bids/types").BidItem) {
    setError("")
    const nextVisibility = bid.status === "global_bid" ? "closed" : "open"
    try {
      const response = await fetch(`/api/site/bids/${encodeURIComponent(bid.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: nextVisibility }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(data.error || "Unable to update visibility.")
      setBids((current) =>
        current.map((row) =>
          row.id === bid.id ? { ...row, status: nextVisibility === "open" ? "global_bid" : "pending" } : row
        )
      )
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Unable to update visibility.")
    }
  }

  function formatDuration(value: string) {
    const trimmed = value.trim()
    if (/day/i.test(trimmed)) return trimmed
    return `${trimmed} Days`
  }

  function formatBudget(value: string) {
    const trimmed = value.trim()
    if (trimmed.startsWith("$")) return trimmed
    return `$${trimmed}`
  }

  function getTabCount(tab: BidListTab) {
    if (tab === "all") return bids.length
    return bids.filter((bid) => bid.status === tab).length
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Post a Bid</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Create and manage your bids so creators can send proposals and start work faster.
            </p>
          </div>
          <Link href="/post-a-bid/new" className={cn(buttonVariants({ size: "lg" }), "h-9")}>
            <PlusCircle className="size-4" />
            Post Bid
          </Link>
        </div>
      </section>

      <Tabs value={statusTab} onValueChange={(next) => setStatusTab(next as BidListTab)}>
        <TabsList className="flex h-auto w-full flex-wrap gap-1 rounded-xl bg-muted/40 p-1">
          {(Object.keys(bidTabLabels) as BidListTab[]).map((tab) => (
            <TabsTrigger key={tab} value={tab} className="h-8 gap-2 rounded-lg px-3 text-sm">
              <span>{bidTabLabels[tab]}</span>
              <Badge variant="secondary" className="h-5 min-w-5 justify-center bg-background px-1.5 text-[10px]">
                {getTabCount(tab)}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-primary/20 bg-linear-to-br from-primary/15 via-card to-card p-4 shadow-sm">
          <div className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Activity className="size-4" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Total bids</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{bids.length}</p>
        </div>
        <div className="rounded-2xl border border-indigo-300/30 bg-linear-to-br from-indigo-500/10 via-card to-card p-4 shadow-sm">
          <div className="inline-flex size-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
            <Eye className="size-4" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Interested creators</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{totalInterested}</p>
        </div>
        <div className="rounded-2xl border border-emerald-300/30 bg-linear-to-br from-emerald-500/10 via-card to-card p-4 shadow-sm">
          <div className="inline-flex size-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
            <Wrench className="size-4" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Creators working</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{activeWorkers}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search bids, skills..."
              className="pl-9"
            />
          </div>
          <Select value={sort} onValueChange={(value) => setSort(value ?? "latest")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">latest</SelectItem>
              <SelectItem value="title">title</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center px-6 py-12 text-sm text-muted-foreground">
            Loading bids...
          </div>
        ) : filteredBids.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <CalendarClock className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No bids found</p>
            <p className="text-sm text-muted-foreground">Try another search or create a new bid.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-[980px] table-fixed text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-muted/20">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bid</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Duration</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Budget</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Interested</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Working</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBids.map((bid) => (
                  <tr key={bid.id} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-2.5">
                        <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <BriefcaseBusiness className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">{bid.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{bid.skillsNeeded}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-foreground">{formatDuration(bid.duration)}</td>
                    <td className="px-4 py-4 font-medium text-foreground">{formatBudget(bid.budget)}</td>
                    <td className="px-4 py-4">
                      {bid.interestedCount > 0 ? (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-foreground">{bid.interestedCount}</p>
                        </div>
                      ) : (
                        <p className="text-xs font-medium text-foreground whitespace-nowrap"> No Creators</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-foreground">
                          {bid.assignedCreator ? "Assigned" : "Open"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {bid.assignedCreator?.name ?? "No one assigned"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="secondary" className={cn("capitalize", statusBadgeClassByStatus[bid.status])}>
                        {visibilityLabelFromStatus(bid.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="outline" size="icon-sm" aria-label="Bid actions">
                                <MoreVertical className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem render={<Link href={`/post-a-bid/${bid.id}/edit`} />}>
                              <PencilLine className="size-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setAssigningBidId(bid.id)}>
                              <Users className="size-4" />
                              Assign creator
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void handleToggleVisibility(bid)}>
                              <BriefcaseBusiness className="size-4" />
                              {bid.status === "global_bid" ? "Close visibility" : "Open visibility"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => void handleDeleteBid(bid.id)}
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {error ? <p className="px-4 py-3 text-xs text-destructive">{error}</p> : null}
      </section>

      <Dialog open={Boolean(assigningBidId)} onOpenChange={(open) => (open ? undefined : setAssigningBidId(null))}>
        <DialogContent className="sm:max-w-lg">
          {assigningBidId ? (
            <>
              <DialogHeader>
                <DialogTitle>Assign bid to creator</DialogTitle>
                <DialogDescription>Pick one interested creator to start this bid.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                {(bids.find((bid) => bid.id === assigningBidId)?.interestedCreators ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No interested creators available for this bid yet.</p>
                ) : (
                  bids
                    .find((bid) => bid.id === assigningBidId)
                    ?.interestedCreators.map((creator) => (
                      <div key={creator.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/70 p-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{creator.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {creator.email || creator.handle || "Creator"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/creators/${creator.id}`}
                            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8")}
                          >
                            View profile
                          </Link>
                          <Button
                            size="sm"
                            className="h-8"
                            disabled={isAssigning}
                            onClick={() => void handleAssignCreator(assigningBidId, creator.id)}
                          >
                            {isAssigning ? <LoaderCircle className="size-3.5 animate-spin" /> : null}
                            Assign
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
