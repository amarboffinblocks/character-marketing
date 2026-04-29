"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { UserRound } from "lucide-react"

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
  pending: "Pending",
  paid: "Paid",
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

  return <pre className="max-h-64 overflow-auto rounded-lg bg-muted/30 p-3 text-xs">{JSON.stringify(parsedPayload, null, 2)}</pre>
}

export function OrdersClientTable({ orders }: OrdersClientTableProps) {
  const [rows] = useState<BuyerOrderRow[]>(orders)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<BuyerOrderRow | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const totalPages = Math.max(1, Math.ceil(rows.length / ORDERS_PER_PAGE))
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ORDERS_PER_PAGE
    return rows.slice(start, start + ORDERS_PER_PAGE)
  }, [currentPage, rows])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const openDialog = (order: BuyerRequestRow) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
  }

  return (
    <>
      <Table>
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 cursor-pointer px-4 font-medium"
                    onClick={() => openDialog(req)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      {rows.length > ORDERS_PER_PAGE ? (
        <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * ORDERS_PER_PAGE + 1}-
            {Math.min(currentPage * ORDERS_PER_PAGE, rows.length)} of {rows.length}
          </p>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1
                return (
                  <PaginationItem key={`buyer-orders-page-${page}`}>
                    <PaginationLink isActive={page === currentPage} onClick={() => setCurrentPage(page)}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              <PaginationItem>
                <PaginationNext
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((current) => Math.min(totalPages, current + 1))}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          {selectedOrder && (() => {
            const creator = safeCreatorSummary(selectedOrder.creator_profile_data)
            return (
              <>
                <DialogHeader>
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
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </>
  )
}
