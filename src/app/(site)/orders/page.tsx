import Link from "next/link"
import { redirect } from "next/navigation"
import pg from "pg"
import { Activity, CalendarClock, CheckCircle2, FolderSearch, Timer } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { OrdersClientTable } from "./orders-client-table"

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

function mapBidStatusToOrderStatus(
  status: string
): OrderStatus {
  if (status === "completed") return "completed"
  if (status === "rejected") return "cancelled"
  return "in_progress"
}

function isMissingOrdersTableError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "42P01"
  )
}

async function fetchBuyerOrders(userId: string): Promise<BuyerOrderRow[]> {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("Missing DIRECT_URL or DATABASE_URL")
  }

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    const assignedBidResult = await client.query(
      `select
        ('bid-order-' || b.id::text) as id,
        ('bid-' || b.id::text) as request_id,
        b.assigned_creator_id as creator_id,
        b.requester_id as buyer_id,
        b.id::text as package_id,
        b.title as package_title,
        coalesce(nullif(regexp_replace(b.budget, '[^0-9.]', '', 'g'), ''), '0')::numeric::int as package_price,
        b.token_count as tokens_label,
        b.status,
        b.updated_at as created_at,
        jsonb_build_object(
          'source', 'bid_post',
          'bidId', b.id,
          'description', b.description,
          'skillsNeeded', b.skills_needed,
          'duration', b.duration,
          'isPriceNegotiable', b.is_price_negotiable
        ) as request_snapshot,
        p.profile_data as creator_profile_data
      from public.bid_posts b
      left join public.profiles p on p.id = b.assigned_creator_id
      where b.requester_id = $1
        and b.assigned_creator_id is not null`,
      [userId]
    )

    const assignedBidOrders = (assignedBidResult.rows ?? []).map((row) => ({
      id: String(row.id),
      request_id: String(row.request_id),
      creator_id: String(row.creator_id ?? ""),
      buyer_id: String(row.buyer_id ?? ""),
      package_id: String(row.package_id ?? ""),
      package_title: String(row.package_title ?? "Bid assignment"),
      package_price: Number(row.package_price ?? 0),
      tokens_label: String(row.tokens_label ?? ""),
      status: mapBidStatusToOrderStatus(String(row.status ?? "")),
      payment_status: "unpaid" as PaymentStatus,
      created_at: String(row.created_at ?? new Date().toISOString()),
      request_snapshot: row.request_snapshot ?? null,
      creator_profile_data: row.creator_profile_data ?? null,
    })) as BuyerOrderRow[]

    try {
      const result = await client.query(
        `select
          o.id,
          o.request_id,
          o.creator_id,
          o.buyer_id,
          o.package_id,
          o.package_title,
          o.package_price,
          o.tokens_label,
          o.status,
          o.payment_status,
          o.created_at,
          o.request_snapshot,
          p.profile_data as creator_profile_data
        from public.orders o
        left join public.profiles p on p.id = o.creator_id
        where o.buyer_id = $1
        order by o.created_at desc`,
        [userId]
      )

      const dbOrders = (result.rows ?? []) as BuyerOrderRow[]
      return [...dbOrders, ...assignedBidOrders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    } catch (error) {
      if (isMissingOrdersTableError(error)) {
        return assignedBidOrders.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      }
      throw error
    }
  } finally {
    await client.end().catch(() => {})
  }
}

export default async function OrdersPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const orders = await fetchBuyerOrders(user.id)
  const openCount = orders.filter((order) =>
    ["pending_payment", "funded", "in_progress", "delivered", "approved"].includes(order.status)
  ).length
  const completedCount = orders.filter((order) => order.status === "completed").length
  const summaryCards = [
    {
      key: "total",
      title: "Total orders",
      value: orders.length,
      note: "Accepted requests converted to orders",
      icon: Activity,
      accent: "text-violet-600",
      ring: "ring-violet-500/20",
      bg: "from-violet-500/10 via-violet-500/5 to-transparent",
    },
    {
      key: "open",
      title: "Open",
      value: openCount,
      note: "Work that is active or awaiting payment",
      icon: Timer,
      accent: "text-amber-600",
      ring: "ring-amber-500/20",
      bg: "from-amber-500/10 via-amber-500/5 to-transparent",
    },
    {
      key: "completed",
      title: "Completed",
      value: completedCount,
      note: "Delivered and closed orders",
      icon: CheckCircle2,
      accent: "text-emerald-600",
      ring: "ring-emerald-500/20",
      bg: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    },
  ] as const

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pt-24 pb-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Orders
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Track accepted requests after they become orders. Payment and fulfillment will attach to
              these records.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/requests"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-9")}
            >
              <CalendarClock className="size-4" />
              View requests
            </Link>
          </div>
        </div>
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
            <span
              className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
              aria-hidden
            >
              <FolderSearch className="size-6" />
            </span>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">No orders yet</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Orders appear once a creator accepts one of your requests.
              </p>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <Link href="/requests" className={buttonVariants()}>
                View requests
              </Link>
              <Link href="/creators" className={buttonVariants({ variant: "outline" })}>
                Find creators
              </Link>
            </div>
          </div>
        ) : (
          <OrdersClientTable orders={orders} />
        )}
      </section>

      <p className="mt-4 text-xs text-muted-foreground">
        Requests and orders are now separate. This page only shows real orders created after creator
        acceptance.
      </p>
    </main>
  )
}
