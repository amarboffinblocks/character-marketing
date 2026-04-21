"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { CalendarClock, PencilLine, PlusCircle, Search, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  bidTabLabels,
  type BidItem,
  type BidListTab,
  type BidStatus,
  initialBids,
} from "@/features/site/bids/data/bids-data"
import { cn } from "@/lib/utils"

const statusBadgeClassByStatus: Record<BidStatus, string> = {
  global_bid: "bg-blue-100 text-blue-700",
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-purple-100 text-purple-700",
  completed: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
}

export function PostABidView() {
  const [bids, setBids] = useState<BidItem[]>(initialBids)
  const [search, setSearch] = useState("")
  const [statusTab, setStatusTab] = useState<BidListTab>("all")
  const [sort, setSort] = useState("latest")

  const filteredBids = useMemo(() => {
    const query = search.trim().toLowerCase()
    const bySearch = bids.filter((bid) => {
      if (!query) return true
      return bid.title.toLowerCase().includes(query) || bid.skillsNeeded.toLowerCase().includes(query)
    })

    const byStatus = bySearch.filter((bid) => (statusTab === "all" ? true : bid.status === statusTab))

    return [...byStatus].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title)
      return b.id.localeCompare(a.id)
    })
  }, [bids, search, sort, statusTab])

  function handleDeleteBid(bidId: string) {
    setBids((current) => current.filter((bid) => bid.id !== bidId))
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
        <ul className="divide-y divide-border/60">
          {filteredBids.map((bid) => (
            <li key={bid.id} className="px-4 py-5 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="max-w-3xl text-lg font-semibold text-foreground">{bid.title}</h3>
                    <Badge
                      variant="secondary"
                      className={cn("capitalize", statusBadgeClassByStatus[bid.status])}
                    >
                      {bidTabLabels[bid.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{bid.createdAgo}</p>
                  <p className="text-sm text-foreground/80">{bid.updatedAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/post-a-bid/${bid.id}/edit`}
                    className={cn(buttonVariants({ variant: "outline" }), "h-9 border-green-700 text-green-700 hover:bg-green-50")}
                  >
                    <PencilLine className="size-4" />
                    Edit Bid
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteBid(bid.id)}
                    className={cn(buttonVariants({ variant: "outline", size: "icon" }), "size-9 text-destructive")}
                    aria-label="Delete bid"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {filteredBids.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <CalendarClock className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No bids found</p>
            <p className="text-sm text-muted-foreground">Try another search or create a new bid.</p>
          </div>
        ) : null}
      </section>
    </div>
  )
}
