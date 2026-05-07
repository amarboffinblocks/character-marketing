import pg from "pg"

import type { CreatorOrder } from "@/features/creator/orders/types"
import type { CreatorOrderRow } from "@/features/creator/orders/creator-orders"

function getConnectionString() {
  return process.env.DIRECT_URL || process.env.DATABASE_URL
}

function asDate(value: unknown): Date {
  const parsed = value instanceof Date ? value : new Date(String(value ?? ""))
  if (Number.isNaN(parsed.getTime())) return new Date()
  return parsed
}

function formatDueDate(date: Date): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
}

function formatUpdated(date: Date): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
}

function buyerDisplayName(profileData: unknown) {
  const root = profileData && typeof profileData === "object" ? (profileData as Record<string, unknown>) : null
  const nested = root?.user && typeof root.user === "object" ? (root.user as Record<string, unknown>) : null
  return (
    (typeof nested?.displayName === "string" && nested.displayName.trim()) ||
    (typeof nested?.name === "string" && nested.name.trim()) ||
    (typeof root?.displayName === "string" && root.displayName.trim()) ||
    (typeof root?.name === "string" && root.name.trim()) ||
    "Buyer"
  )
}

function creatorDisplayName(profileData: unknown) {
  const root = profileData && typeof profileData === "object" ? (profileData as Record<string, unknown>) : null
  const nested = root?.creator && typeof root.creator === "object" ? (root.creator as Record<string, unknown>) : null
  const user = root?.user && typeof root.user === "object" ? (root.user as Record<string, unknown>) : null
  
  return (
    (typeof nested?.displayName === "string" && nested.displayName.trim()) ||
    (typeof nested?.name === "string" && nested.name.trim()) ||
    (typeof user?.displayName === "string" && user.displayName.trim()) ||
    (typeof user?.name === "string" && user.name.trim()) ||
    (typeof root?.displayName === "string" && root.displayName.trim()) ||
    (typeof root?.name === "string" && root.name.trim()) ||
    "Creator"
  )
}

function mapStatus(input: CreatorOrderRow["status"]): CreatorOrder["status"] {
  if (input === "in_progress") return "in_progress"
  if (input === "on_hold" || input === "approved") return "waiting_on_buyer"
  if (input === "delivered" || input === "reviewing") return "delivered"
  if (input === "completed") return "completed"
  if (input === "cancelled") return "cancelled"
  if (input === "refunded") return "refunded"
  return "new"
}

function mapPriority(input: CreatorOrderRow["status"], paymentStatus: CreatorOrderRow["payment_status"]): CreatorOrder["priority"] {
  if (input === "completed" && paymentStatus === "pending") return "high"
  if (input === "pending_payment" || input === "on_hold" || input === "approved") return "high"
  if (input === "in_progress" || input === "delivered") return "medium"
  return "low"
}

function toCreatorOrder(row: CreatorOrderRow): CreatorOrder {
  const createdAt = asDate(row.created_at)
  const updatedAt = asDate(row.updated_at)
  const status = row.status === "completed" && row.payment_status === "pending" ? "delivered" : mapStatus(row.status)
  const dueAt =
    status === "completed"
      ? createdAt
      : new Date(createdAt.getTime() + 1000 * 60 * 60 * 24 * 7)

  const normalizedId = String(row.id ?? "")
  const orderId = normalizedId.startsWith("bid-order-")
    ? `BID-${normalizedId.replace(/^bid-order-/, "").slice(0, 8)}`
    : `ORD-${normalizedId.replace(/-/g, "").slice(0, 8).toUpperCase()}`

  return {
    id: orderId,
    customerName: buyerDisplayName(row.buyer_profile_data),
    creatorName: creatorDisplayName(row.creator_profile_data),
    packageName: row.package_title || "Order package",
    amount: Number(row.package_price ?? 0),
    dueDate: formatDueDate(dueAt),
    dueDateTime: dueAt.toISOString(),
    updatedAt: formatUpdated(updatedAt),
    updatedAtTime: updatedAt.toISOString(),
    status,
    priority: mapPriority(row.status, row.payment_status),
    needsResponse:
      row.status === "pending_payment" ||
      row.status === "on_hold" ||
      row.status === "approved" ||
      (row.status === "completed" && row.payment_status === "pending"),
    rawOrderId: row.id,
    rawStatus: row.status,
    paymentStatus: row.payment_status,
    creatorId: row.creator_id,
    buyerId: row.buyer_id,
  }
}

export async function fetchAdminOrders(): Promise<CreatorOrder[]> {
  const connectionString = getConnectionString()
  if (!connectionString) return []

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()

    const [ordersResult, bidsResult] = await Promise.all([
      client.query(
        `select
          o.id,
          o.request_id,
          o.buyer_id,
          o.creator_id,
          o.package_id,
          o.package_title,
          o.package_price,
          o.tokens_label,
          o.status,
          o.payment_status,
          o.created_at,
          o.updated_at,
          o.request_snapshot,
          p.profile_data as buyer_profile_data,
          cp.profile_data as creator_profile_data
        from public.orders o
        left join public.profiles p on p.id = o.buyer_id
        left join public.profiles cp on cp.id = o.creator_id
        order by o.created_at desc`
      ),
      client.query(
        `select
          ('bid-order-' || b.id::text) as id,
          ('bid-' || b.id::text) as request_id,
          b.requester_id as buyer_id,
          b.assigned_creator_id as creator_id,
          b.id::text as package_id,
          b.title as package_title,
          coalesce(nullif(regexp_replace(b.budget, '[^0-9.]', '', 'g'), ''), '0')::numeric::int as package_price,
          b.token_count as tokens_label,
          case
            when b.status = 'completed' then 'completed'
            when b.status = 'rejected' then 'cancelled'
            when b.status = 'pending' then 'on_hold'
            when b.status = 'processing' then 'in_progress'
            else 'in_progress'
          end as status,
          'unpaid'::text as payment_status,
          b.created_at,
          b.updated_at,
          jsonb_build_object(
            'source', 'bid_post',
            'bidId', b.id,
            'description', b.description
          ) as request_snapshot,
          p.profile_data as buyer_profile_data,
          cp.profile_data as creator_profile_data
        from public.bid_posts b
        left join public.profiles p on p.id = b.requester_id
        left join public.profiles cp on cp.id = b.assigned_creator_id
        where b.assigned_creator_id is not null
        order by b.created_at desc`
      ),
    ])

    const rows = [...(ordersResult.rows ?? []), ...(bidsResult.rows ?? [])] as CreatorOrderRow[]
    return rows
      .map(toCreatorOrder)
      .sort((a, b) => new Date(b.updatedAtTime).getTime() - new Date(a.updatedAtTime).getTime())
  } finally {
    await client.end().catch(() => {})
  }
}
