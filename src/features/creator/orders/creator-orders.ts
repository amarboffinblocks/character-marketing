import pg from "pg"

export type CreatorOrderStatus =
  | "pending_payment"
  | "funded"
  | "in_progress"
  | "on_hold"
  | "delivered"
  | "approved"
  | "completed"
  | "cancelled"
  | "refunded"
  | "pending"
  | "reviewing"
 

export type CreatorPaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded"

export type CreatorOrderRow = {
  id: string
  request_id: string
  buyer_id: string
  creator_id: string
  package_id: string
  package_title: string
  package_price: number
  tokens_label: string
  status: CreatorOrderStatus
  payment_status: CreatorPaymentStatus
  /** ISO string from JSON, or `Date` when read directly from `pg`. */
  created_at: string | Date
  updated_at: string | Date
  request_snapshot: unknown
  buyer_profile_data: unknown | null
}

function mapBidStatusToOrderStatus(status: string): CreatorOrderStatus {
  if (status === "completed") return "completed"
  if (status === "rejected") return "cancelled"
  if (status === "pending") return "on_hold"
  if (status === "processing") return "in_progress"
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

function getConnectionString() {
  return process.env.DIRECT_URL || process.env.DATABASE_URL
}

export async function fetchCreatorOrders(creatorId: string): Promise<CreatorOrderRow[]> {
  const connectionString = getConnectionString()
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
        b.requester_id as buyer_id,
        b.assigned_creator_id as creator_id,
        b.id::text as package_id,
        b.title as package_title,
        coalesce(nullif(regexp_replace(b.budget, '[^0-9.]', '', 'g'), ''), '0')::numeric::int as package_price,
        b.token_count as tokens_label,
        b.status,
        b.updated_at,
        jsonb_build_object(
          'source', 'bid_post',
          'bidId', b.id,
          'description', b.description,
          'skillsNeeded', b.skills_needed,
          'duration', b.duration,
          'isPriceNegotiable', b.is_price_negotiable
        ) as request_snapshot,
        p.profile_data as buyer_profile_data
      from public.bid_posts b
      left join public.profiles p on p.id = b.requester_id
      where b.assigned_creator_id = $1`,
      [creatorId]
    )

    const assignedBidOrders = (assignedBidResult.rows ?? []).map((row) => ({
      id: String(row.id),
      request_id: String(row.request_id),
      buyer_id: String(row.buyer_id ?? ""),
      creator_id: String(row.creator_id ?? ""),
      package_id: String(row.package_id ?? ""),
      package_title: String(row.package_title ?? "Bid assignment"),
      package_price: Number(row.package_price ?? 0),
      tokens_label: String(row.tokens_label ?? ""),
      status: mapBidStatusToOrderStatus(String(row.status ?? "")),
      payment_status: "unpaid" as CreatorPaymentStatus,
      created_at: String(row.updated_at ?? new Date().toISOString()),
      updated_at: String(row.updated_at ?? new Date().toISOString()),
      request_snapshot: row.request_snapshot ?? null,
      buyer_profile_data: row.buyer_profile_data ?? null,
    })) as CreatorOrderRow[]

    try {
      const result = await client.query(
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
          p.profile_data as buyer_profile_data
        from public.orders o
        left join public.profiles p on p.id = o.buyer_id
        where o.creator_id = $1
        order by o.created_at desc`,
        [creatorId]
      )
      const dbOrders = (result.rows ?? []) as CreatorOrderRow[]
      return [...dbOrders, ...assignedBidOrders].map((order) => ({
        ...order,
        status: order.status === "approved" ? "on_hold" : order.status,
      })).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    } catch (error) {
      if (isMissingOrdersTableError(error)) {
        return assignedBidOrders.map((order) => ({
          ...order,
          status: order.status === "approved" ? "on_hold" : order.status,
        })).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      }
      throw error
    }
  } finally {
    await client.end().catch(() => {})
  }
}

export async function updateCreatorOrderStatus(input: {
  orderId: string
  creatorId: string
  status: "pending" | "processing" | "on_hold" | "completed"
}) {
  const connectionString = getConnectionString()
  if (!connectionString) {
    throw new Error("Missing DIRECT_URL or DATABASE_URL")
  }

  const nextDbStatus =
    input.status === "pending"
      ? "pending_payment"
      : input.status === "processing"
        ? "in_progress"
        : input.status === "on_hold"
          ? "approved"
          : "completed"
  const isBidOrder = input.orderId.startsWith("bid-order-")
  const bidId = isBidOrder ? input.orderId.replace(/^bid-order-/, "").trim() : ""

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    if (isBidOrder) {
      if (!bidId) {
        throw new Error("Invalid bid order id.")
      }
      const nextBidStatus =
        input.status === "completed"
          ? "completed"
          : input.status === "on_hold" || input.status === "pending"
            ? "pending"
            : "processing"

      const bidResult = await client.query(
        `update public.bid_posts
         set status = $1, updated_at = now()
         where id = $2 and assigned_creator_id = $3
         returning id, status, updated_at`,
        [nextBidStatus, bidId, input.creatorId]
      )

      if (!bidResult.rows[0]) {
        throw new Error("Order not found.")
      }

      return {
        id: `bid-order-${String(bidResult.rows[0].id)}`,
        status: input.status,
        updatedAt: String(bidResult.rows[0].updated_at ?? new Date().toISOString()),
      }
    }

    const result = await client.query(
      `update public.orders
       set status = $1, updated_at = now()
       where id = $2 and creator_id = $3
       returning id, status, updated_at`,
      [nextDbStatus, input.orderId, input.creatorId]
    )

    if (!result.rows[0]) {
      throw new Error("Order not found.")
    }

    return {
      id: String(result.rows[0].id),
      status: input.status,
      updatedAt: String(result.rows[0].updated_at ?? new Date().toISOString()),
    }
  } finally {
    await client.end().catch(() => {})
  }
}
