"use client"

import { useMemo, useState } from "react"
import {
  FolderKanban,
  HandCoins,
  History,
  LayoutDashboard,
  LoaderCircle,
  Search,
  Settings2,
} from "lucide-react"
import { toast } from "sonner"

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminPageHero } from "@/features/admin/components/admin-page-hero"
import { OrdersListCard } from "@/features/creator/orders/components/orders-list-card"
import { OrdersSummaryCards } from "@/features/creator/orders/components/orders-summary-cards"
import { OrdersToolbar } from "@/features/creator/orders/components/orders-toolbar"
import {
  OrdersViewTabs,
  type SavedView,
} from "@/features/creator/orders/components/orders-view-tabs"
import type { CreatorOrder } from "@/features/creator/orders/types"
import type {
  OrderQuickFilter,
  OrderSortValue,
  OrderStatusFilter,
} from "@/features/creator/orders/utils"
import { applyOrderFilters, sortOrders } from "@/features/creator/orders/utils"

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

export function AdminOrdersView({ initialOrders }: { initialOrders: CreatorOrder[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<OrderStatusFilter>("all")
  const [sort, setSort] = useState<OrderSortValue>("updated-desc")
  const [quickFilters, setQuickFilters] = useState<OrderQuickFilter[]>([])
  const [view, setView] = useState<SavedView>("all")
  const [releasingOrderId, setReleasingOrderId] = useState<string | null>(null)
  const [orderToRelease, setOrderToRelease] = useState<CreatorOrder | null>(null)

  const filteredOrders = useMemo(() => {
    const filtered = applyOrderFilters(orders, {
      search,
      status,
      quickFilters,
    })
    return sortOrders(filtered, sort)
  }, [orders, quickFilters, search, sort, status])

  const releaseQueue = useMemo(
    () =>
      orders.filter(
        (order) =>
          (order.rawStatus === "completed" || order.rawStatus === "delivered") &&
          order.paymentStatus === "pending"
      ),
    [orders]
  )

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

  async function handleRelease(order: CreatorOrder) {
    if (!order.rawOrderId || releasingOrderId) return

    setReleasingOrderId(order.rawOrderId)
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(order.rawOrderId)}/release`, {
        method: "POST",
      })
      const json = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(json.error || "Unable to release payment.")
      }

      setOrders((current) =>
        current.map((item) =>
          item.rawOrderId === order.rawOrderId
            ? {
                ...item,
                status: "completed",
                rawStatus: "completed",
                paymentStatus: "paid",
                needsResponse: false,
                priority: "low",
                updatedAt: new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                }),
                updatedAtTime: new Date().toISOString(),
              }
            : item
        )
      )
      toast.success("Creator payment released.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to release payment.")
    } finally {
      setReleasingOrderId(null)
      setOrderToRelease(null)
    }
  }

  return (
    <>
      <ConfirmationDialog
        open={!!orderToRelease}
        onOpenChange={(open) => !open && setOrderToRelease(null)}
        onConfirm={() => orderToRelease && handleRelease(orderToRelease)}
        isLoading={!!releasingOrderId}
        title="Release Payout?"
        description={`Confirm payout release for ${orderToRelease?.packageName}? This will transfer funds from escrow to the creator.`}
        confirmText="Release Payout"
      />
      <div className="flex flex-col gap-8">
      <AdminPageHero
        icon={FolderKanban}
        badge="Platform operations"
        title="Order queue"
        description="Monitor delivery timelines, manage payouts, and escalate issues across all marketplace activity."
        tone="studio"
        actions={
          <>
            <Button variant="outline" className="bg-background/50 backdrop-blur-sm">
              <History className="size-4" />
              SLA history
            </Button>
            <Button variant="outline" className="bg-background/50 backdrop-blur-sm">
              <Settings2 className="size-4" />
              Queue settings
            </Button>
          </>
        }
      />

     
      <OrdersSummaryCards
        orders={orders}
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
        title="Platform work queue"
        description="Monitor delivery timelines and escalations across all creators and buyers."
        hasActiveFilters={hasActiveFilters}
        context="admin"
      />
       <Card className="overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 to-transparent shadow-md">
        <CardHeader className="flex flex-row items-center justify-between border-b border-primary/10 bg-primary/5 pb-4">
          <div>
            <CardTitle className="text-lg">Manual Payout Queue</CardTitle>
            <CardDescription className="text-primary/70">
              {releaseQueue.length} order{releaseQueue.length === 1 ? "" : "s"} waiting for manual escrow release.
            </CardDescription>
          </div>
          <HandCoins className="size-5 text-primary/40" />
        </CardHeader>
        <CardContent className="divide-y divide-primary/5 p-0">
          {releaseQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-3 rounded-full bg-emerald-500/10 p-2">
                <LayoutDashboard className="size-5 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-foreground">Escrow queue is clear</p>
              <p className="text-xs text-muted-foreground">No delivered orders are currently waiting for payout release.</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {releaseQueue.map((order) => {
                const isReleasing = releasingOrderId === order.rawOrderId
                return (
                  <div
                    key={order.rawOrderId}
                    className="flex flex-col gap-4 p-4 transition-colors hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-background p-2 ring-1 ring-border shadow-xs">
                        <HandCoins className="size-4 text-primary" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-foreground">{order.packageName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.customerName} · <span className="font-mono">{order.id.slice(0, 8)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden flex-col items-end sm:flex">
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700">Delivered</Badge>
                        <p className="mt-1 text-[10px] font-medium text-muted-foreground">Pending Payout</p>
                      </div>
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 shadow-sm"
                        onClick={() => setOrderToRelease(order)}
                        disabled={isReleasing}
                      >
                        {isReleasing ? (
                          <LoaderCircle className="size-3.5 animate-spin" />
                        ) : (
                          <HandCoins className="size-3.5" />
                        )}
                        Release
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
    </>
  )
}
