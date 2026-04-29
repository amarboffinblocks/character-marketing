"use client"

import { useMemo, useState } from "react"
import { PackageCheck, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { CreatorOrderRow, CreatorOrderStatus, CreatorPaymentStatus } from "@/features/creator/orders/creator-orders"
import { cn } from "@/lib/utils"

const orderStatusLabel: Record<CreatorOrderStatus, string> = {
  pending_payment: "Pending payment",
  funded: "Funded",
  in_progress: "In progress",
  delivered: "Delivered",
  approved: "Approved",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
}

const orderStatusClass: Record<CreatorOrderStatus, string> = {
  pending_payment: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  funded: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  in_progress: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  delivered: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  approved: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
  completed: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  cancelled: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  refunded: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
}

const paymentStatusLabel: Record<CreatorPaymentStatus, string> = {
  unpaid: "Unpaid",
  pending: "Pending",
  paid: "Paid",
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

function formatCreatedAt(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
}

function safeBuyerSummary(profileData: unknown) {
  const root = profileData && typeof profileData === "object" ? (profileData as Record<string, unknown>) : null
  const user = root && root.user && typeof root.user === "object" ? (root.user as Record<string, unknown>) : null

  const displayName =
    (user && typeof user.displayName === "string" && user.displayName.trim()) ||
    (user && typeof user.name === "string" && user.name.trim()) ||
    (root && typeof root.displayName === "string" && root.displayName.trim()) ||
    (root && typeof root.name === "string" && root.name.trim()) ||
    "Buyer"

  const avatarUrl =
    (user && typeof user.avatarUrl === "string" ? user.avatarUrl.trim() : "") ||
    (root && typeof root.avatarUrl === "string" ? root.avatarUrl.trim() : "")

  return {
    displayName,
    avatarUrl: avatarUrl.length > 0 ? avatarUrl : null,
  }
}

export function CreatorAcceptedOrdersView({ initialOrders }: { initialOrders: CreatorOrderRow[] }) {
  const [orders] = useState(initialOrders)

  const openCount = useMemo(
    () =>
      orders.filter((o) =>
        ["pending_payment", "funded", "in_progress", "delivered", "approved"].includes(o.status)
      ).length,
    [orders]
  )

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pt-6 pb-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Creator Orders</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Accepted requests become orders and move here for payment and fulfillment tracking.
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-border/70 p-4">
          <p className="text-sm text-muted-foreground">Total orders</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{orders.length}</p>
        </Card>
        <Card className="rounded-2xl border-border/70 p-4">
          <p className="text-sm text-muted-foreground">Active orders</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{openCount}</p>
        </Card>
        <Card className="rounded-2xl border-border/70 p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            {orders.filter((o) => o.status === "completed").length}
          </p>
        </Card>
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
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </section>
    </main>
  )
}
