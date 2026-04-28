import Link from "next/link"
import { redirect } from "next/navigation"
import pg from "pg"
import { CalendarClock, FolderSearch, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { createServerSupabaseClient } from "@/lib/supabase/server"

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
  request_payload: unknown
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

const requestTypeLabel: Record<RequestType, string> = {
  custom_package: "Custom package",
  preselect_package: "Pre-select",
}

const requestStatusLabel: Record<RequestStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  accepted: "Accepted",
  rejected: "Rejected",
  completed: "Completed",
}

const requestStatusClass: Record<RequestStatus, string> = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  processing: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  accepted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rejected: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  completed: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
}

function safeCreatorSummary(profileData: unknown) {
  const root = profileData && typeof profileData === "object" ? (profileData as Record<string, unknown>) : null
  const creator =
    root && root.creator && typeof root.creator === "object" ? (root.creator as Record<string, unknown>) : null

  const displayName =
    (creator && typeof creator.displayName === "string" && creator.displayName.trim()) ||
    (creator && typeof creator.name === "string" && creator.name.trim()) ||
    ""

  const handle = creator && typeof creator.handle === "string" ? creator.handle.trim() : ""
  const avatarUrl = creator && typeof creator.avatarUrl === "string" ? creator.avatarUrl.trim() : ""

  return {
    displayName,
    handle: handle.startsWith("@") || handle.length === 0 ? handle : `@${handle}`,
    avatarUrl: avatarUrl.length > 0 ? avatarUrl : null,
  }
}

function getRequestCategoryLabel(request: BuyerRequestRow) {
  const payload = request.request_payload
  if (!payload || typeof payload !== "object") return "—"

  // Custom requests store details under `details`, preselect stores counts under `requestedAssets`.
  if (request.request_type === "custom_package") {
    const details = (payload as Record<string, unknown>).details
    if (!details || typeof details !== "object") return "Custom assets"

    const detailObj = details as Record<string, unknown>
    const keys = ["character", "persona", "lorebook", "background", "avatar"] as const
    const counts = keys
      .map((k) => {
        const v = detailObj[k]
        const n = Array.isArray(v) ? v.length : 0
        return n > 0 ? `${k}:${n}` : null
      })
      .filter(Boolean)
      .slice(0, 3)

    return counts.length > 0 ? counts.join(" · ") : "Custom assets"
  }

  const requestedAssets = (payload as Record<string, unknown>).requestedAssets
  if (!requestedAssets || typeof requestedAssets !== "object") return "—"
  const ra = requestedAssets as Record<string, unknown>
  const keys = ["character", "persona", "lorebook", "background", "avatar"] as const
  const counts = keys
    .map((k) => {
      const n = typeof ra[k] === "number" ? ra[k] : 0
      return n > 0 ? `${k}:${n}` : null
    })
    .filter(Boolean)
    .slice(0, 3)
  return counts.length > 0 ? counts.join(" · ") : "—"
}

async function fetchBuyerRequests(userId: string): Promise<BuyerRequestRow[]> {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("Missing DIRECT_URL or DATABASE_URL")
  }

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
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
        r.request_payload,
        p.profile_data as creator_profile_data
      from public.requests r
      left join public.profiles p on p.id = r.creator_id
      where r.requester_id = $1
      order by r.created_at desc`,
      [userId]
    )

    return (result.rows ?? []) as BuyerRequestRow[]
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

  const requests = await fetchBuyerRequests(user.id)

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pt-24 pb-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Orders
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Track every request you’ve sent to creators — status, pricing, and what you asked for.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/creators"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-9")}
            >
              <CalendarClock className="size-4" />
              Browse creators
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-border/70 bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total requests</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{requests.length}</p>
        </Card>
        <Card className="rounded-2xl border-border/70 bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Open</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {requests.filter((r) => r.status === "pending" || r.status === "processing").length}
          </p>
        </Card>
        <Card className="rounded-2xl border-border/70 bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {requests.filter((r) => r.status === "completed").length}
          </p>
        </Card>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span
              className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
              aria-hidden
            >
              <FolderSearch className="size-6" />
            </span>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">No requests yet</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                When you request a custom package or pre-select package from a creator, it will show
                up here.
              </p>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <Link href="/creators" className={buttonVariants()}>
                Find creators
              </Link>
              <Link href="/saved-creators" className={buttonVariants({ variant: "outline" })}>
                View saved creators
              </Link>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Creator</TableHead>
                <TableHead>Request</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="w-[140px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => {
                const creator = safeCreatorSummary(req.creator_profile_data)
                const creatorName = creator.displayName || "Creator"
                const creatorHandle = creator.handle
                const creatorSlug = req.creator_id
                return (
                  <TableRow key={req.id}>
                       <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
                          aria-hidden
                        >
                          <UserRound className="size-4" />
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{creatorName}</span>
                          {creatorHandle ? (
                            <span className="text-xs text-muted-foreground">{creatorHandle}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {creatorSlug.slice(0, 8)}…
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground">{req.package_title}</span>
                        <span className="text-xs text-muted-foreground">#{req.id}</span>
                      </div>
                    </TableCell>
                 
                    <TableCell>
                      <Badge variant="secondary" className="font-medium">
                        {requestTypeLabel[req.request_type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {getRequestCategoryLabel(req)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn("font-medium", requestStatusClass[req.status])}
                      >
                        {requestStatusLabel[req.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatCreatedAt(req.created_at)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(req.package_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/creators/${req.creator_id}`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7")}
                        >
                          View
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </section>

      <p className="mt-4 text-xs text-muted-foreground">
        Showing requests sent from this account. Status updates will reflect creator processing and
        fulfillment.
      </p>
    </main>
  )
}
