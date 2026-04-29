import Link from "next/link"
import { redirect } from "next/navigation"
import pg from "pg"
import { Activity, CalendarClock, CheckCircle2, FolderSearch, Timer } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { RequestsClientTable } from "./requests-client-table"

type RequestType = "custom_package" | "preselect_package"
type RequestStatus = "pending" | "processing" | "accepted" | "rejected" | "completed"

type BuyerRequestRow = {
  id: string
  request_type: RequestType
  creator_id: string
  requester_id: string
  package_id: string
  package_title: string
  package_price: number
  tokens_label: string
  status: RequestStatus
  created_at: string
  creator_profile_data: unknown | null
  order_id: string | null
}

function isMissingOrdersTableError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "42P01"
  )
}

async function fetchBuyerRequests(userId: string): Promise<BuyerRequestRow[]> {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("Missing DIRECT_URL or DATABASE_URL")
  }

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    try {
      const result = await client.query(
        `select
          r.id,
          r.request_type,
          r.creator_id,
          r.requester_id,
          r.package_id,
          r.package_title,
          r.package_price,
          r.tokens_label,
          r.status,
          r.created_at,
          p.profile_data as creator_profile_data,
          o.id as order_id
        from public.requests r
        left join public.profiles p on p.id = r.creator_id
        left join public.orders o on o.request_id = r.id
        where r.requester_id = $1
        order by r.created_at desc`,
        [userId]
      )

      return (result.rows ?? []) as BuyerRequestRow[]
    } catch (error) {
      if (isMissingOrdersTableError(error)) {
        const fallbackResult = await client.query(
          `select
            r.id,
            r.request_type,
            r.creator_id,
            r.requester_id,
            r.package_id,
            r.package_title,
            r.package_price,
            r.tokens_label,
            r.status,
            r.created_at,
            p.profile_data as creator_profile_data,
            null::uuid as order_id
          from public.requests r
          left join public.profiles p on p.id = r.creator_id
          where r.requester_id = $1
          order by r.created_at desc`,
          [userId]
        )
        return (fallbackResult.rows ?? []) as BuyerRequestRow[]
      }
      throw error
    }
  } finally {
    await client.end().catch(() => {})
  }
}

export default async function RequestsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const requests = await fetchBuyerRequests(user.id)
  const openCount = requests.filter((r) => r.status === "pending" || r.status === "processing").length
  const acceptedCount = requests.filter((r) => r.status === "accepted").length
  const summaryCards = [
    {
      key: "total",
      title: "Total requests",
      value: requests.length,
      note: "All requests you've submitted",
      icon: Activity,
      accent: "text-violet-600",
      ring: "ring-violet-500/20",
      bg: "from-violet-500/10 via-violet-500/5 to-transparent",
    },
    {
      key: "open",
      title: "Open",
      value: openCount,
      note: "Pending or processing requests",
      icon: Timer,
      accent: "text-amber-600",
      ring: "ring-amber-500/20",
      bg: "from-amber-500/10 via-amber-500/5 to-transparent",
    },
    {
      key: "accepted",
      title: "Accepted",
      value: acceptedCount,
      note: "Ready to become or linked to orders",
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
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Requests</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Track requests before they are accepted. Accepted requests can create orders.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/orders" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-9")}>
              <CalendarClock className="size-4" />
              View orders
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
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
              <FolderSearch className="size-6" />
            </span>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">No requests yet</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Submit a custom package request or pre-select package request to get started.
              </p>
            </div>
            <Link href="/creators" className={buttonVariants()}>
              Find creators
            </Link>
          </div>
        ) : (
          <RequestsClientTable requests={requests} />
        )}
      </section>
    </main>
  )
}
