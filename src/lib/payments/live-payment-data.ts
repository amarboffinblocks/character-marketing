import pg from "pg"

function getConnectionString() {
  return process.env.DIRECT_URL || process.env.DATABASE_URL
}

export type LiveTransaction = {
  id: string
  orderId: string
  label: string
  amountCents: number
  creatorName: string
  status: "completed" | "pending" | "rejected"
  createdAt: string
  updatedAt: string
  settledAt?: string
  reason?: string
}

export type LiveEarningTransaction = {
  id: string
  orderId: string
  buyerName: string
  packageName: string
  amount: number    // full order value in dollars
  fee: number       // platform fee in dollars (10%)
  net: number       // creator net in dollars
  date: string
  status: "paid" | "pending" | "processing" | "failed"
}

export type CreatorEarningsSummary = {
  totalNet: number
  totalPending: number
  totalPaid: number
  totalFees: number
  totalGross: number
  averageOrder: number
  transactions: LiveEarningTransaction[]
  dailySeries: number[]
}

export type BuyerTransactionSummary = {
  transactions: LiveTransaction[]
  completedVolumeCents: number
  pendingVolumeCents: number
}

function creatorDisplayName(profileData: unknown): string {
  const root = profileData && typeof profileData === "object" ? (profileData as Record<string, unknown>) : null
  const nested = root?.creator && typeof root.creator === "object" ? (root.creator as Record<string, unknown>) : null
  return (
    (typeof nested?.displayName === "string" && nested.displayName.trim()) ||
    (typeof nested?.name === "string" && nested.name.trim()) ||
    (typeof root?.displayName === "string" && root.displayName.trim()) ||
    "Creator"
  )
}

function buyerDisplayName(profileData: unknown): string {
  const root = profileData && typeof profileData === "object" ? (profileData as Record<string, unknown>) : null
  const nested = root?.user && typeof root.user === "object" ? (root.user as Record<string, unknown>) : null
  return (
    (typeof nested?.displayName === "string" && nested.displayName.trim()) ||
    (typeof nested?.name === "string" && nested.name.trim()) ||
    (typeof root?.displayName === "string" && root.displayName.trim()) ||
    "Buyer"
  )
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function buildLast30DailySeries(rows: { created_at: Date; package_price: number }[]): number[] {
  const byDay = new Map<string, number>()
  for (const r of rows) {
    const key = new Date(r.created_at).toISOString().slice(0, 10)
    byDay.set(key, (byDay.get(key) ?? 0) + r.package_price * 0.9) // 90% net
  }
  const out: number[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setUTCHours(0, 0, 0, 0)
    d.setUTCDate(d.getUTCDate() - i)
    out.push(byDay.get(d.toISOString().slice(0, 10)) ?? 0)
  }
  return out
}

// ---------------------------------------------------------------------------
// Buyer: fetch payment history from payment_transactions
// ---------------------------------------------------------------------------
export async function fetchBuyerTransactions(buyerId: string): Promise<BuyerTransactionSummary> {
  const connectionString = getConnectionString()
  if (!connectionString) return { transactions: [], completedVolumeCents: 0, pendingVolumeCents: 0 }

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    const result = await client.query(
      `select
         pt.id,
         pt.order_id,
         pt.amount,
         pt.status,
         pt.transaction_type,
         pt.created_at,
         pt.updated_at,
         o.package_title,
         o.payment_status as order_payment_status,
         cp.profile_data as creator_profile_data
       from public.payment_transactions pt
       join public.orders o on o.id = pt.order_id
       left join public.profiles cp on cp.id = o.creator_id
       where pt.buyer_id = $1
         and pt.transaction_type = 'charge'
       order by pt.created_at desc
       limit 100`,
      [buyerId]
    )

    const transactions: LiveTransaction[] = result.rows.map((row) => {
      const isPaid =
        row.status === "succeeded" &&
        (row.order_payment_status === "paid" || row.order_payment_status === "pending")
      const isFailed = row.status === "failed" || row.order_payment_status === "failed" || row.order_payment_status === "refunded"

      return {
        id: `TXN-${String(row.id).slice(0, 8).toUpperCase()}`,
        orderId: row.order_id,
        label: row.package_title || "Order payment",
        amountCents: Number(row.amount) * 100,
        creatorName: creatorDisplayName(row.creator_profile_data),
        status: isFailed ? "rejected" : isPaid ? "completed" : "pending",
        createdAt: formatDate(new Date(row.created_at)),
        updatedAt: formatDate(new Date(row.updated_at)),
        settledAt: isPaid ? formatDate(new Date(row.updated_at)) : undefined,
      }
    })

    const completedVolumeCents = transactions
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + t.amountCents, 0)
    const pendingVolumeCents = transactions
      .filter((t) => t.status === "pending")
      .reduce((sum, t) => sum + t.amountCents, 0)

    return { transactions, completedVolumeCents, pendingVolumeCents }
  } finally {
    await client.end().catch(() => {})
  }
}

// ---------------------------------------------------------------------------
// Creator: fetch earnings from payment_transactions (release type = paid out)
// ---------------------------------------------------------------------------
export async function fetchCreatorEarnings(creatorId: string): Promise<CreatorEarningsSummary> {
  const connectionString = getConnectionString()
  if (!connectionString) {
    return { totalNet: 0, totalPending: 0, totalPaid: 0, totalFees: 0, totalGross: 0, averageOrder: 0, transactions: [], dailySeries: [] }
  }

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()

    // Fetch all completed order transactions for the creator
    const result = await client.query(
      `select
         o.id as order_id,
         o.package_title,
         o.package_price,
         o.payment_status,
         o.status as order_status,
         o.created_at,
         pt.id as txn_id,
         pt.status as txn_status,
         pt.transaction_type,
         pt.updated_at as txn_updated_at,
         bp.profile_data as buyer_profile_data
       from public.orders o
       left join public.payment_transactions pt on pt.order_id = o.id
         and pt.transaction_type in ('charge', 'release')
       left join public.profiles bp on bp.id = o.buyer_id
       where o.creator_id = $1
         and o.payment_status in ('pending', 'paid', 'refunded')
       order by o.created_at desc
       limit 100`,
      [creatorId]
    )

    const PLATFORM_FEE_RATE = 0.10 // 10% platform fee

    const transactions: LiveEarningTransaction[] = result.rows.map((row) => {
      const gross = Number(row.package_price ?? 0)
      const fee = Math.round(gross * PLATFORM_FEE_RATE * 100) / 100
      const net = Math.round((gross - fee) * 100) / 100

      // payment_status: 'paid' = transfer done, 'pending' = escrowed, 'refunded' = refunded
      let status: LiveEarningTransaction["status"] = "pending"
      if (row.payment_status === "paid") status = "paid"
      else if (row.payment_status === "refunded") status = "failed"
      else if (row.transaction_type === "release" && row.txn_status === "succeeded") status = "paid"
      else if (row.order_status === "in_progress" || row.order_status === "delivered") status = "processing"

      return {
        id: row.txn_id ? `TXN-${String(row.txn_id).slice(0, 8).toUpperCase()}` : `ORD-${String(row.order_id).slice(0, 8).toUpperCase()}`,
        orderId: `ORD-${String(row.order_id).replace(/-/g, "").slice(0, 8).toUpperCase()}`,
        buyerName: buyerDisplayName(row.buyer_profile_data),
        packageName: row.package_title || "Order package",
        amount: gross,
        fee,
        net,
        date: formatDate(new Date(row.created_at)),
        status,
      }
    })

    const totalGross = transactions.reduce((s, t) => s + t.amount, 0)
    const totalFees = transactions.reduce((s, t) => s + t.fee, 0)
    const totalNet = transactions.reduce((s, t) => s + t.net, 0)
    const totalPaid = transactions.filter((t) => t.status === "paid").reduce((s, t) => s + t.net, 0)
    const totalPending = transactions.filter((t) => t.status === "pending" || t.status === "processing").reduce((s, t) => s + t.net, 0)
    const averageOrder = transactions.length > 0 ? Math.round(totalGross / transactions.length) : 0

    const dailySeries = buildLast30DailySeries(result.rows.map((r) => ({
      created_at: new Date(r.created_at),
      package_price: Number(r.package_price ?? 0),
    })))

    return { totalNet, totalPending, totalPaid, totalFees, totalGross, averageOrder, transactions, dailySeries }
  } finally {
    await client.end().catch(() => {})
  }
}
