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
  creator_profile_data: unknown | null
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
        p.profile_data as buyer_profile_data,
        cp.profile_data as creator_profile_data
      from public.orders o
      left join public.profiles p on p.id = o.buyer_id
      left join public.profiles cp on cp.id = o.creator_id
      where o.creator_id = $1
      order by o.created_at desc`,
      [creatorId]
    )
    return (result.rows ?? []) as CreatorOrderRow[]
  } finally {
    await client.end().catch(() => {})
  }
}

export async function updateCreatorOrderStatus(input: {
  orderId: string
  creatorId: string
  status: "pending" | "processing" | "on_hold" | "reviewing" | "delivered" | "completed"
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
          ? "on_hold"
          : input.status === "reviewing"
            ? "delivered"
            : input.status === "delivered"
              ? "delivered"
              : "completed"

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    const result = await client.query(
      `update public.orders
       set status = $1, updated_at = now()
       where id = $2 and creator_id = $3
       returning id, buyer_id, package_title, status, updated_at, request_snapshot`,
      [nextDbStatus, input.orderId, input.creatorId]
    )

    const row = result.rows[0]
    if (!row) {
      throw new Error("Order not found.")
    }

    // Sync with bid_post if this order came from a bid
    const snapshot =
      row.request_snapshot && typeof row.request_snapshot === "object"
        ? (row.request_snapshot as { bidId?: unknown; source?: unknown; requestPayload?: { bidId?: unknown; source?: unknown } })
        : null
    const bidId =
      typeof snapshot?.bidId === "string"
        ? snapshot.bidId
        : typeof snapshot?.requestPayload?.bidId === "string"
          ? snapshot.requestPayload.bidId
          : ""

    if (
      bidId &&
      (snapshot?.source === "bid_post" || snapshot?.requestPayload?.source === "bid_post")
    ) {
      const nextBidStatus = input.status === "completed" ? "completed" : "processing"
      await client.query(
        `update public.bid_posts set status = $1, updated_at = now() where id = $2`,
        [nextBidStatus, bidId]
      )
    }

    return {
      id: String(row.id),
      buyerId: String(row.buyer_id),
      packageTitle: String(row.package_title ?? ""),
      status: input.status,
      updatedAt: String(row.updated_at ?? new Date().toISOString()),
    }
  } finally {
    await client.end().catch(() => {})
  }
}
