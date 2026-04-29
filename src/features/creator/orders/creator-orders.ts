import pg from "pg"

export type CreatorOrderStatus =
  | "pending_payment"
  | "funded"
  | "in_progress"
  | "delivered"
  | "approved"
  | "completed"
  | "cancelled"
  | "refunded"

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
  created_at: string
  updated_at: string
  request_snapshot: unknown
  buyer_profile_data: unknown | null
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
      return (result.rows ?? []) as CreatorOrderRow[]
    } catch (error) {
      if (isMissingOrdersTableError(error)) {
        return []
      }
      throw error
    }
  } finally {
    await client.end().catch(() => {})
  }
}
