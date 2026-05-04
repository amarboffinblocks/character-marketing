"use client"

import { useMemo, useState } from "react"
import { Activity, CheckCircle2, LoaderCircle, PackageCheck, Timer, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { CreatorOrderRow, CreatorOrderStatus, CreatorPaymentStatus } from "@/features/creator/orders/creator-orders"
import { buyerSummaryFromProfileData } from "@/lib/profile-buyer-display"
import { cn } from "@/lib/utils"

const orderStatusLabel: Record<CreatorOrderStatus, string> = {
  pending: "Awaiting start",
  pending_payment: "Pending",
  funded: "Funded",
  in_progress: "Processing",
  on_hold: "On hold",
  reviewing: "Under review",
  delivered: "Delivered",
  approved: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
}

const orderStatusClass: Record<CreatorOrderStatus, string> = {
  pending: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
  pending_payment: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  funded: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  in_progress: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  on_hold: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  reviewing: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
  delivered: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  approved: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  completed: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  cancelled: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  refunded: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
}

const paymentStatusLabel: Record<CreatorPaymentStatus, string> = {
  unpaid: "Unpaid",
  pending: "In escrow",
  paid: "Released",
  failed: "Failed",
  refunded: "Refunded",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatCreatedAt(value: string | Date) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
}

function safeBuyerSummary(profileData: unknown) {
  const b = buyerSummaryFromProfileData(profileData)
  return {
    displayName: b.displayName || "Buyer",
    avatarUrl: b.avatarUrl,
  }
}

function OrderSnapshotDetails({ order }: { order: CreatorOrderRow }) {
  let payload = order.request_snapshot
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload)
    } catch {
      payload = undefined
    }
  }
  const parsedPayload = payload as Record<string, unknown> | undefined
  if (!parsedPayload) return null
  const requestTypeRaw =
    (typeof parsedPayload.requestType === "string" && parsedPayload.requestType) ||
    (typeof parsedPayload.source === "string" ? parsedPayload.source : "")
  const requestPayload =
    parsedPayload.requestPayload && typeof parsedPayload.requestPayload === "object"
      ? (parsedPayload.requestPayload as Record<string, unknown>)
      : {}
  const notes =
    (typeof requestPayload.notes === "string" && requestPayload.notes) ||
    (typeof requestPayload.instructions === "string" && requestPayload.instructions) ||
    (typeof requestPayload.messageToCreator === "string" && requestPayload.messageToCreator) ||
    ""
  const acceptedAt =
    typeof parsedPayload.acceptedAt === "string" ? new Date(parsedPayload.acceptedAt) : null

  const revisionMessage = typeof parsedPayload.revision_message === "string" ? parsedPayload.revision_message : ""

  const requestedAssets =
    requestPayload.requestedAssets && typeof requestPayload.requestedAssets === "object"
      ? (requestPayload.requestedAssets as Record<string, unknown>)
      : {}
  const assetKeys = ["character", "persona", "lorebook", "background", "avatar"] as const
  const hasAssetCounts = assetKeys.some((key) => typeof requestedAssets[key] === "number" && Number(requestedAssets[key]) > 0)

  const detailEntries = Object.entries(requestPayload).filter(([key, value]) => {
    if (value === null || value === undefined || value === "") return false
    if (key === "requestedAssets" || key === "notes" || key === "instructions" || key === "messageToCreator") return false
    return true
  })

  return (
    <div className="space-y-3 text-sm">
      {revisionMessage && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-900/30 dark:bg-rose-900/10">
          <p className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Revision requested</p>
          <p className="mt-1 font-medium text-foreground">{revisionMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border/60 bg-muted/15 p-3">
          <p className="text-xs font-semibold text-muted-foreground">Request type</p>
          <p className="mt-1 font-medium text-foreground">
            {requestTypeRaw === "preselect_package"
              ? "Pre-select package"
              : requestTypeRaw === "custom_package"
                ? "Custom package"
                : requestTypeRaw || "—"}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-muted/15 p-3">
          <p className="text-xs font-semibold text-muted-foreground">Accepted on</p>
          <p className="mt-1 font-medium text-foreground">
            {acceptedAt && !Number.isNaN(acceptedAt.getTime())
              ? acceptedAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
              : "—"}
          </p>
        </div>
      </div>

      {hasAssetCounts ? (
        <div className="rounded-lg border border-border/60 bg-muted/15 p-3">
          <p className="text-xs font-semibold text-muted-foreground">Included assets</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {assetKeys.map((key) => {
              const count = typeof requestedAssets[key] === "number" ? Number(requestedAssets[key]) : 0
              if (count <= 0) return null
              return (
                <div key={key} className="rounded-md border border-border/50 bg-background/70 px-2 py-1.5 text-center">
                  <p className="text-sm font-semibold text-foreground">{count}</p>
                  <p className="text-[11px] capitalize text-muted-foreground">{key}s</p>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {detailEntries.length > 0 ? (
        <div className="rounded-lg border border-border/60 bg-muted/15 p-3">
          <p className="text-xs font-semibold text-muted-foreground">Request details</p>
          <div className="mt-2 space-y-2">
            {detailEntries.map(([key, value]) => (
              <div key={key}>
                <p className="text-[11px] font-semibold text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <p className="whitespace-pre-wrap text-sm text-foreground">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {notes ? (
        <div className="rounded-lg border border-border/60 bg-muted/15 p-3">
          <p className="text-xs font-semibold text-muted-foreground">Initial instructions</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{notes}</p>
        </div>
      ) : null}
    </div>
  )
}

export function CreatorAcceptedOrdersView({ initialOrders }: { initialOrders: CreatorOrderRow[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<CreatorOrderRow | null>(null)
  const [orderToView, setOrderToView] = useState<CreatorOrderRow | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [nextStatus, setNextStatus] = useState<"pending" | "processing" | "on_hold" | "delivered" | "completed">("pending")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [error, setError] = useState("")

  function toStatusOption(status: CreatorOrderStatus): "pending" | "processing" | "on_hold" | "delivered" | "completed" {
    if (status === "pending_payment") return "pending"
    if (status === "in_progress") return "processing"
    if (status === "delivered") return "delivered"
    if (status === "on_hold" || status === "approved") return "on_hold"
    if (status === "completed") return "completed"
    return "processing"
  }

  function openStatusModal(order: CreatorOrderRow) {
    setSelectedOrder(order)
    setNextStatus(toStatusOption(order.status))
    setError("")
  }

  function openViewModal(order: CreatorOrderRow) {
    setOrderToView(order)
    setIsViewDialogOpen(true)
  }

  async function confirmStatusUpdate() {
    if (!selectedOrder) return
    setIsUpdatingStatus(true)
    setError("")
    try {
      const response = await fetch(`/api/creator/orders/${encodeURIComponent(selectedOrder.id)}/order-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      const json = (await response.json()) as {
        error?: string
        order?: {
          id: string
          status?: CreatorOrderStatus | "completed"
          paymentStatus?: CreatorPaymentStatus
        }
      }
      if (!response.ok) {
        throw new Error(json.error || "Unable to update order status.")
      }
      const nextLocalStatus: CreatorOrderStatus =
        nextStatus === "pending"
          ? "pending_payment"
          : nextStatus === "processing"
            ? "in_progress"
            : nextStatus === "delivered"
              ? "delivered"
              : nextStatus === "on_hold"
                ? "on_hold"
                : "completed"
      setOrders((current) =>
        current.map((order) =>
          order.id === selectedOrder.id
            ? {
              ...order,
              status: nextLocalStatus,
              payment_status: json.order?.paymentStatus ?? order.payment_status,
            }
            : order
        )
      )
      setSelectedOrder(null)
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update order status.")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const openCount = useMemo(
    () =>
      orders.filter((o) =>
        ["pending_payment", "funded", "in_progress", "delivered", "approved"].includes(o.status)
      ).length,
    [orders]
  )

  const completedCount = useMemo(
    () => orders.filter((o) => o.status === "completed").length,
    [orders]
  )
  const summaryCards = [
    {
      key: "total",
      title: "Total orders",
      value: orders.length,
      note: "All assigned and accepted work items",
      icon: Activity,
      accent: "text-violet-600",
      ring: "ring-violet-500/20",
      bg: "from-violet-500/10 via-violet-500/5 to-transparent",
    },
    {
      key: "active",
      title: "Active orders",
      value: openCount,
      note: "In progress or waiting for next action",
      icon: Timer,
      accent: "text-amber-600",
      ring: "ring-amber-500/20",
      bg: "from-amber-500/10 via-amber-500/5 to-transparent",
    },
    {
      key: "completed",
      title: "Completed",
      value: completedCount,
      note: "Successfully finished deliveries",
      icon: CheckCircle2,
      accent: "text-emerald-600",
      ring: "ring-emerald-500/20",
      bg: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    },
  ] as const

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pt-6 pb-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Creator Orders</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Accepted requests become orders here. Buyers fund them through Stripe escrow, then you
          complete the work and receive the release payout.
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card
              key={card.key}
              className={cn(
                "relative overflow-hidden rounded-2xl border-border/70 bg-card p-4 shadow-sm",
                "bg-linear-to-br",
                card.bg
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{card.value}</p>
                </div>
                <span
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-lg bg-background/80 ring-1 shadow-xs",
                    card.ring
                  )}
                >
                  <Icon className={cn("size-4.5", card.accent)} />
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{card.note}</p>
            </Card>
          )
        })}
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
              <PackageCheck className="size-6" />
            </span>
            <h2 className="text-base font-semibold text-foreground">No orders yet</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Accept buyer requests in the Requests queue to create orders.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Buyer</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-center">Price</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const buyer = safeBuyerSummary(order.buyer_profile_data)
                return (
                  <TableRow key={order.id}>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2.5">
                        {buyer.avatarUrl ? (
                          <img src={buyer.avatarUrl} alt={buyer.displayName} className="size-9 rounded-full object-cover shadow-xs" />
                        ) : (
                          <span className="inline-flex size-9 items-center justify-center rounded-full bg-muted/80 text-muted-foreground shadow-xs" aria-hidden>
                            <UserRound className="size-4.5" />
                          </span>
                        )}
                        <span className="text-sm font-semibold tracking-tight text-foreground">{buyer.displayName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground">{order.package_title}</span>
                        <span className="text-xs text-muted-foreground">#{order.id.slice(0, 8)}...</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/10 text-xs">
                        {paymentStatusLabel[order.payment_status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn("font-medium px-2.5 py-0.5 rounded-md", orderStatusClass[order.status])}>
                        {orderStatusLabel[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatCreatedAt(order.created_at)}</TableCell>
                    <TableCell className="text-center font-semibold text-foreground">{formatCurrency(order.package_price)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openViewModal(order)}>
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openStatusModal(order)}>
                          Update status
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </section>
      <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => (!open ? setSelectedOrder(null) : null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update order status</DialogTitle>
            <DialogDescription>
              Confirm status update for <span className="font-medium text-foreground">{selectedOrder?.package_title ?? "order"}</span>.
              Move to <span className="font-medium text-foreground">Delivered</span> when ready for buyer review.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Next status</p>
            <Select value={nextStatus} onValueChange={(value) => setNextStatus(value as "pending" | "processing" | "on_hold" | "delivered" | "completed")}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="on_hold">On hold</SelectItem>
                <SelectItem value="Reviewing">Go for review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            {error ? <p className="text-xs text-rose-600">{error}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)} disabled={isUpdatingStatus}>
              Cancel
            </Button>
            <Button onClick={() => void confirmStatusUpdate()} disabled={isUpdatingStatus}>
              {isUpdatingStatus ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Confirm update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0">
          {orderToView && (() => {
            const buyer = safeBuyerSummary(orderToView.buyer_profile_data)
            return (
              <>
                <DialogHeader className="border-b border-border/60 px-6 pt-6 pb-4">
                  <div className="flex items-center gap-3 mb-1">
                    {buyer.avatarUrl ? (
                      <img
                        src={buyer.avatarUrl}
                        alt={buyer.displayName || "Buyer"}
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        className="inline-flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground"
                        aria-hidden
                      >
                        <UserRound className="size-5" />
                      </span>
                    )}
                    <div className="flex flex-col text-left">
                      <DialogTitle className="text-base font-semibold">
                        {orderToView.package_title}
                      </DialogTitle>
                      <DialogDescription className="text-xs">
                        Order #{orderToView.id.slice(0, 8)}...
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
                  <div className="mt-4 divide-y divide-border/50">
                    <div className="pb-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Buyer</p>
                        <p className="mt-0.5 font-medium text-foreground">{buyer.displayName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Status</p>
                        <Badge
                          variant="secondary"
                          className={cn("mt-1 font-medium px-2 py-0.5 rounded-md text-xs", orderStatusClass[orderToView.status])}
                        >
                          {orderStatusLabel[orderToView.status]}
                        </Badge>
                      </div>
                    </div>

                    <div className="py-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Earnings</p>
                        <p className="mt-0.5 text-lg font-semibold text-foreground">
                          {formatCurrency(orderToView.package_price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Payment</p>
                        <p className="mt-0.5 text-base font-medium text-foreground">
                          {paymentStatusLabel[orderToView.payment_status]}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <p className="mb-3 text-xs font-semibold text-muted-foreground">Order details</p>
                      <OrderSnapshotDetails order={orderToView} />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="px-6">
                      Close
                    </Button>
                    <Button onClick={() => {
                      setIsViewDialogOpen(false);
                      openStatusModal(orderToView);
                    }} className="px-6">
                      Update status
                    </Button>
                  </div>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </main>
  )
}
