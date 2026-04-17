"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { CalendarClock, Inbox } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { OrdersListCard } from "@/features/creator/orders/components/orders-list-card"
import { OrdersSummaryCards } from "@/features/creator/orders/components/orders-summary-cards"
import { OrdersToolbar } from "@/features/creator/orders/components/orders-toolbar"
import { creatorOrders } from "@/features/creator/orders/data"
import type {
  OrderQuickFilter,
  OrderSortValue,
  OrderStatusFilter,
} from "@/features/creator/orders/utils"
import { applyOrderFilters, sortOrders } from "@/features/creator/orders/utils"
import { cn } from "@/lib/utils"

type CreatorOrdersViewProps = {
  scope?: "all" | "active" | "completed"
}

export function CreatorOrdersView({ scope = "all" }: CreatorOrdersViewProps) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<OrderStatusFilter>(() => {
    if (scope === "active") return "in_progress"
    if (scope === "completed") return "completed"
    return "all"
  })
  const [sort, setSort] = useState<OrderSortValue>("due-asc")
  const [quickFilters, setQuickFilters] = useState<OrderQuickFilter[]>([])

  const filteredOrders = useMemo(() => {
    const filtered = applyOrderFilters(creatorOrders, {
      search,
      status,
      quickFilters,
    })
    return sortOrders(filtered, sort)
  }, [quickFilters, search, sort, status])

  const hasActiveFilters =
    search.trim().length > 0 || status !== "all" || quickFilters.length > 0

  function toggleQuickFilter(value: OrderQuickFilter) {
    setQuickFilters((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    )
  }

  function resetFilters() {
    setSearch("")
    setStatus("all")
    setSort("due-asc")
    setQuickFilters([])
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Orders
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Manage accepted orders, monitor delivery timelines, and keep every
              project moving through your production queue.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/creator/requests"
              className={cn(buttonVariants({ variant: "outline" }), "h-9")}
            >
              <Inbox className="size-4" />
              View Requests
            </Link>
            <Button variant="default" size="lg" className="h-9">
              <CalendarClock className="size-4" />
              Update Availability
            </Button>
          </div>
        </div>
      </section>

      <OrdersSummaryCards orders={filteredOrders} />

      <OrdersToolbar
        search={search}
        status={status}
        sort={sort}
        quickFilters={quickFilters}
        resultsCount={filteredOrders.length}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onQuickFilterToggle={toggleQuickFilter}
        onResetFilters={resetFilters}
      />

      <OrdersListCard
        orders={filteredOrders}
        title="Creator Work Queue"
        description="Use this queue to prioritize delivery, follow up with buyers, and keep turnaround times consistent."
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  )
}
