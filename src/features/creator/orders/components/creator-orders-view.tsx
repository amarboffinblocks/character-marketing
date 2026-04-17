"use client"

import { useMemo, useState } from "react"
import { CalendarClock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { OrdersListCard } from "@/features/creator/orders/components/orders-list-card"
import { OrdersSummaryCards } from "@/features/creator/orders/components/orders-summary-cards"
import { OrdersToolbar } from "@/features/creator/orders/components/orders-toolbar"
import {
  OrdersViewTabs,
  type SavedView,
} from "@/features/creator/orders/components/orders-view-tabs"
import { creatorOrders } from "@/features/creator/orders/data"
import type {
  OrderQuickFilter,
  OrderSortValue,
  OrderStatusFilter,
} from "@/features/creator/orders/utils"
import { applyOrderFilters, sortOrders } from "@/features/creator/orders/utils"

type CreatorOrdersViewProps = {
  scope?: "all" | "active" | "completed"
}

function applySavedView(
  view: SavedView,
  setStatus: (value: OrderStatusFilter) => void,
  setQuickFilters: (updater: (current: OrderQuickFilter[]) => OrderQuickFilter[]) => void
) {
  switch (view) {
    case "all":
      setStatus("all")
      setQuickFilters(() => [])
      return
    case "needs_response":
      setStatus("all")
      setQuickFilters(() => ["needs_response"])
      return
    case "due_soon":
      setStatus("all")
      setQuickFilters(() => ["due_soon"])
      return
    case "in_progress":
      setStatus("in_progress")
      setQuickFilters(() => [])
      return
    case "waiting":
      setStatus("waiting_on_buyer")
      setQuickFilters(() => [])
      return
    case "completed":
      setStatus("completed")
      setQuickFilters(() => [])
      return
    case "overdue":
      setStatus("all")
      setQuickFilters(() => ["overdue"])
      return
  }
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
  const [view, setView] = useState<SavedView>("all")

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
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    )
  }

  function resetFilters() {
    setSearch("")
    setStatus("all")
    setSort("due-asc")
    setQuickFilters([])
    setView("all")
  }

  function handleViewChange(nextView: SavedView) {
    setView(nextView)
    applySavedView(nextView, setStatus, setQuickFilters)
  }

  function handleApplyStatusFromCard(next: OrderStatusFilter) {
    setView("all")
    setStatus((current) => (current === next ? "all" : next))
  }

  function handleApplyQuickFilterFromCard(next: OrderQuickFilter) {
    setView("all")
    toggleQuickFilter(next)
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Orders
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Manage accepted orders, monitor delivery timelines, and keep every project moving
              through your production queue.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="default" size="lg" className="h-9">
              <CalendarClock className="size-4" />
              Update Availability
            </Button>
          </div>
        </div>
      </section>

      <OrdersSummaryCards
        orders={creatorOrders}
        activeStatus={status}
        activeQuickFilters={quickFilters}
        onApplyStatus={handleApplyStatusFromCard}
        onApplyQuickFilter={handleApplyQuickFilterFromCard}
      />

      <OrdersViewTabs value={view} onChange={handleViewChange} />

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
