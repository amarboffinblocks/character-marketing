import pg from "pg"

export type TransactionStatus = "pending" | "succeeded" | "failed" | "refunded"

export type TransactionRow = {
  id: string
  order_id: string
  amount: number
  currency: string
  payment_method: string
  provider: string
  provider_reference: string
  status: TransactionStatus
  created_at: string
  package_title: string
  order_status: string
  payment_status: string
  counterpart_profile_data: unknown | null
}

function getConnectionString() {
  return process.env.DIRECT_URL || process.env.DATABASE_URL
}

function isMissingTransactionsTableError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "42P01"
  )
}

export async function fetchBuyerTransactions(userId: string): Promise<TransactionRow[]> {
  const connectionString = getConnectionString()
  if (!connectionString) throw new Error("Missing DIRECT_URL or DATABASE_URL")

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    const result = await client.query(
      `select
        t.id,
        t.order_id,
        t.amount,
        t.currency,
        t.payment_method,
        t.provider,
        t.provider_reference,
        t.status,
        t.created_at,
        o.package_title,
        o.status as order_status,
        o.payment_status,
        p.profile_data as counterpart_profile_data
       from public.payment_transactions t
       join public.orders o on o.id = t.order_id
       left join public.profiles p on p.id = t.creator_id
       where t.buyer_id = $1
       order by t.created_at desc`,
      [userId]
    )
    return (result.rows ?? []) as TransactionRow[]
  } catch (error) {
    if (isMissingTransactionsTableError(error)) return []
    throw error
  } finally {
    await client.end().catch(() => {})
  }
}

export async function fetchCreatorTransactions(userId: string): Promise<TransactionRow[]> {
  const connectionString = getConnectionString()
  if (!connectionString) throw new Error("Missing DIRECT_URL or DATABASE_URL")

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    const result = await client.query(
      `select
        t.id,
        t.order_id,
        t.amount,
        t.currency,
        t.payment_method,
        t.provider,
        t.provider_reference,
        t.status,
        t.created_at,
        o.package_title,
        o.status as order_status,
        o.payment_status,
        p.profile_data as counterpart_profile_data
       from public.payment_transactions t
       join public.orders o on o.id = t.order_id
       left join public.profiles p on p.id = t.buyer_id
       where t.creator_id = $1
       order by t.created_at desc`,
      [userId]
    )
    return (result.rows ?? []) as TransactionRow[]
  } catch (error) {
    if (isMissingTransactionsTableError(error)) return []
    throw error
  } finally {
    await client.end().catch(() => {})
  }
}
