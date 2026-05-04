"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { LoaderCircle, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type OrderStatus =
  | "pending_payment"
  | "funded"
  | "in_progress"
  | "delivered"
  | "approved"
  | "completed"
  | "cancelled"
  | "refunded"
type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded"

type BuyerOrderRow = {
  id: string
  request_id: string
  creator_id: string
  buyer_id: string
  package_id: string
  package_title: string
  package_price: number
  tokens_label: string
  status: OrderStatus
  payment_status: PaymentStatus
  created_at: string
  request_snapshot: unknown
  creator_profile_data: unknown | null
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatCreatedAt(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
}

const orderStatusLabel: Record<OrderStatus, string> = {
  pending_payment: "Pending payment",
  funded: "Funded",
  in_progress: "In progress",
  delivered: "Delivered",
  approved: "Approved",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
}

const orderStatusClass: Record<OrderStatus, string> = {
  pending_payment: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  funded: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  in_progress: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  delivered: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  approved: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
  completed: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  cancelled: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  refunded: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
}

const paymentStatusLabel: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  pending: "In escrow",
  paid: "Released",
  failed: "Failed",
  refunded: "Refunded",
}

function safeCreatorSummary(profileData: unknown) {
  const root = profileData && typeof profileData === "object" ? (profileData as Record<string, unknown>) : null
  const creator =
    root && root.creator && typeof root.creator === "object" ? (root.creator as Record<string, unknown>) : null

  const displayName =
    (creator && typeof creator.displayName === "string" && creator.displayName.trim()) ||
    (creator && typeof creator.name === "string" && creator.name.trim()) ||
    (root && typeof root.displayName === "string" && root.displayName.trim()) ||
    (root && typeof root.name === "string" && root.name.trim()) ||
    ""

  const handle = 
    (creator && typeof creator.handle === "string" ? creator.handle.trim() : "") ||
    (root && typeof root.handle === "string" ? root.handle.trim() : "")

  const avatarUrl = 
    (creator && typeof creator.avatarUrl === "string" ? creator.avatarUrl.trim() : "") ||
    (root && typeof root.avatarUrl === "string" ? root.avatarUrl.trim() : "")

  return {
    displayName,
    handle: handle.startsWith("@") || handle.length === 0 ? handle : `@${handle}`,
    avatarUrl: avatarUrl.length > 0 ? avatarUrl : null,
  }
}

interface OrdersClientTableProps {
  orders: BuyerOrderRow[]
}

const ORDERS_PER_PAGE = 12

function OrderSnapshotDetails({ order }: { order: BuyerOrderRow }) {
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
          <p className="text-xs font-semibold text-muted-foreground">Instructions</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{notes}</p>
        </div>
      ) : null}
    </div>
  )
}

export function OrdersClientTable({ orders }: OrdersClientTableProps) {
  const [rows, setRows] = useState<BuyerOrderRow[]>(orders)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<BuyerOrderRow | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null)
  const [actingOrderId, setActingOrderId] = useState<string | null>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [updateMessage, setUpdateMessage] = useState("")
  const [orderToUpdate, setOrderToUpdate] = useState<BuyerOrderRow | null>(null)
  const totalPages = Math.max(1, Math.ceil(rows.length / ORDERS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedRows = useMemo(() => {
    const start = (safeCurrentPage - 1) * ORDERS_PER_PAGE
    return rows.slice(start, start + ORDERS_PER_PAGE)
  }, [safeCurrentPage, rows])

  const openDialog = (order: BuyerOrderRow) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
  }

  const openUpdateDialog = (order: BuyerOrderRow) => {
    setOrderToUpdate(order)
    setUpdateMessage("")
    setIsUpdateDialogOpen(true)
  }

  const handlePayNow = async (order: BuyerOrderRow) => {
    if (payingOrderId) return
    setPayingOrderId(order.id)
    try {
      const response = await fetch(`/api/site/orders/${encodeURIComponent(order.id)}`, {
        method: "POST",
      })
      const json = (await response.json()) as {
        error?: string
        order?: { id: string; paymentStatus: PaymentStatus; status: OrderStatus }
        checkoutUrl?: string | null
      }
      if (!response.ok) {
        throw new Error(json.error || "Unable to process payment.")
      }
      if (json.checkoutUrl) {
        window.location.href = json.checkoutUrl
        return
      }
      if (!json.order) {
        throw new Error("Unable to start Stripe checkout.")
      }
      setRows((current) =>
        current.map((item) =>
          item.id === order.id
            ? {
                ...item,
                payment_status: json.order?.paymentStatus ?? item.payment_status,
                status: json.order?.status ?? item.status,
              }
            : item
        )
      )
      setSelectedOrder((current) =>
        current && current.id === order.id
          ? {
              ...current,
              payment_status: json.order?.paymentStatus ?? current.payment_status,
              status: json.order?.status ?? current.status,
            }
          : current
      )
    } catch {
      // Silent fail for now; parent page does not provide toast system.
    } finally {
      setPayingOrderId(null)
    }
  }

  const handleOrderAction = async (order: BuyerOrderRow, action: "approve" | "request_update", message?: string) => {
    if (actingOrderId || payingOrderId) return
    setActingOrderId(order.id)
    try {
      const response = await fetch(`/api/site/orders/${encodeURIComponent(order.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, message }),
      })
      const json = (await response.json()) as {
        error?: string
        order?: { id: string; paymentStatus: PaymentStatus; status: OrderStatus }
      }
      if (!response.ok) {
        throw new Error(json.error || "Unable to update order.")
      }
      if (!json.order) return
      setRows((current) =>
        current.map((item) =>
          item.id === order.id
            ? {
                ...item,
                payment_status: json.order?.paymentStatus ?? item.payment_status,
                status: json.order?.status ?? item.status,
              }
            : item
        )
      )
      setSelectedOrder((current) =>
        current && current.id === order.id
          ? {
              ...current,
              payment_status: json.order?.paymentStatus ?? current.payment_status,
              status: json.order?.status ?? current.status,
            }
          : current
      )
    } catch {
      // Silent fail for now; parent page does not provide toast system.
    } finally {
      setActingOrderId(null)
    }
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[980px]">
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="py-4">Creator</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-center">Price</TableHead>
            <TableHead className="w-[100px] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedRows.map((req) => {
            const creator = safeCreatorSummary(req.creator_profile_data)
            const creatorName = creator.displayName || "Creator"
            const creatorHandle = creator.handle
            const creatorSlug = req.creator_id
            const canPay =
              !req.id.startsWith("bid-order-") &&
              (req.payment_status === "unpaid" || req.payment_status === "failed")
            const canApprove = req.status === "delivered" && req.payment_status === "pending"
            const canRequestUpdate = req.status === "delivered"
            const isPaying = payingOrderId === req.id
            const isActing = actingOrderId === req.id
            return (
              <TableRow key={req.id} className="hover:bg-muted/10">
                <TableCell className="py-5">
                  <div className="flex items-center gap-3">
                    {creator.avatarUrl ? (
                      <img
                        src={creator.avatarUrl}
                        alt={creatorName}
                        className="size-9 rounded-full object-cover shadow-xs"
                      />
                    ) : (
                      <span
                        className="inline-flex size-9 items-center justify-center rounded-full bg-muted/80 text-muted-foreground shadow-xs"
                        aria-hidden
                      >
                        <UserRound className="size-4.5" />
                      </span>
                    )}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold tracking-tight text-foreground">
                        {creatorName}
                      </span>
                      {creatorHandle ? (
                        <span className="text-xs text-muted-foreground/85">{creatorHandle}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground/85">
                          {creatorSlug.slice(0, 8)}…
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground">{req.package_title}</span>
                    <span className="text-xs text-muted-foreground">#{req.id.slice(0, 8)}...</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="py-3  px-2 text-xs bg-primary/10">
                    {paymentStatusLabel[req.payment_status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("font-medium px-2.5 py-0.5 rounded-md", orderStatusClass[req.status])}
                  >
                    {orderStatusLabel[req.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatCreatedAt(req.created_at)}
                </TableCell>
                <TableCell className="text-center font-semibold text-foreground">
                  {formatCurrency(req.package_price)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {canPay ? (
                      <Button
                        size="sm"
                        className="h-8 cursor-pointer px-3 font-medium"
                        disabled={isPaying}
                        onClick={() => void handlePayNow(req)}
                      >
                        {isPaying ? <LoaderCircle className="size-3.5 animate-spin" /> : null}
                        Pay now
                      </Button>
                    ) : null}
                    {canRequestUpdate ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 cursor-pointer px-3 font-medium"
                        disabled={isActing}
                        onClick={() => void openUpdateDialog(req)}
                      >
                        {isActing ? <LoaderCircle className="size-3.5 animate-spin" /> : null}
                        New update
                      </Button>
                    ) : null}
                    {canApprove ? (
                      <Button
                        size="sm"
                        className="h-8 cursor-pointer px-3 font-medium"
                        disabled={isActing}
                        onClick={() => void handleOrderAction(req, "approve")}
                      >
                        {isActing ? <LoaderCircle className="size-3.5 animate-spin" /> : null}
                        Approve
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 cursor-pointer px-4 font-medium"
                      onClick={() => openDialog(req)}
                    >
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
        </Table>
      </div>
      {rows.length > ORDERS_PER_PAGE ? (
        <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Showing {(safeCurrentPage - 1) * ORDERS_PER_PAGE + 1}-
            {Math.min(safeCurrentPage * ORDERS_PER_PAGE, rows.length)} of {rows.length}
          </p>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1
                return (
                  <PaginationItem key={`buyer-orders-page-${page}`}>
                    <PaginationLink isActive={page === safeCurrentPage} onClick={() => setCurrentPage(page)}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              <PaginationItem>
                <PaginationNext
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((current) => Math.min(totalPages, current + 1))}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[65vh] overflow-y-auto p-0">
          {selectedOrder && (() => {
            const creator = safeCreatorSummary(selectedOrder.creator_profile_data)
            return (
              <>
                <DialogHeader className="border-b border-border/60 px-6 pt-6 pb-4">
                  <div className="flex items-center gap-3 mb-1">
                    {creator.avatarUrl ? (
                      <img
                        src={creator.avatarUrl}
                        alt={creator.displayName || "Creator"}
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
                        {selectedOrder.package_title}
                      </DialogTitle>
                      <DialogDescription className="text-xs">
                        Order #{selectedOrder.id.slice(0, 8)}...
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">
                <div className="mt-4 divide-y divide-border/50">
                  <div className="pb-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Creator</p>
                      <p className="mt-0.5 font-medium text-foreground">{creator.displayName || "Creator"}</p>
                      <p className="text-xs text-muted-foreground">{creator.handle}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Status</p>
                      <Badge
                        variant="secondary"
                        className={cn("mt-1 font-medium px-2 py-0.5 rounded-md text-xs", orderStatusClass[selectedOrder.status])}
                      >
                        {orderStatusLabel[selectedOrder.status]}
                      </Badge>
                    </div>
                  </div>

                  <div className="py-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Price</p>
                      <p className="mt-0.5 text-lg font-semibold text-foreground">
                        {formatCurrency(selectedOrder.package_price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Tokens</p>
                      <p className="mt-0.5 text-base font-medium text-foreground">
                        {selectedOrder.tokens_label || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Payment</p>
                      <p className="mt-0.5 text-base font-medium text-foreground">
                        {paymentStatusLabel[selectedOrder.payment_status]}
                      </p>
                    </div>
                  </div>

                  <div className="py-4 text-sm">
                    <p className="text-xs font-semibold text-muted-foreground">Created On</p>
                    <p className="mt-0.5 font-medium text-foreground">
                      {new Date(selectedOrder.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="pt-4">
                    <p className="mb-2 text-xs font-semibold text-muted-foreground">Request snapshot</p>
                    <OrderSnapshotDetails order={selectedOrder} />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Link
                    href={`/creators/${selectedOrder.creator_id}`}
                    className={cn(buttonVariants({ variant: "outline" }), "px-4")}
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Visit Profile
                  </Link>
                  <Button onClick={() => setIsDialogOpen(false)} className="px-4">
                    Close
                  </Button>
                </div>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request an update</DialogTitle>
            <DialogDescription>
              Tell the creator what you'd like to change.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Revision instructions</p>
              <Textarea
                placeholder="e.g. Please change the hair color to blue..."
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
          </div>
          <DialogFooter className="flex items-center sm:justify-between">
            <Button variant="ghost" onClick={() => setIsUpdateDialogOpen(false)} disabled={actingOrderId === orderToUpdate?.id}>
              Cancel
            </Button>
            <Button
              disabled={!updateMessage.trim() || actingOrderId === orderToUpdate?.id}
              onClick={async () => {
                if (!orderToUpdate) return
                await handleOrderAction(orderToUpdate, "request_update", updateMessage)
                setIsUpdateDialogOpen(false)
              }}
            >
              {actingOrderId === orderToUpdate?.id ? <LoaderCircle className="size-4 animate-spin mr-2" /> : null}
              Send request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
