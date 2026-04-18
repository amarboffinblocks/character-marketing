/** Demo time series — trailing daily GMV (USD, illustrative). */
export const adminReportGmvSeries: number[] = [
  4200, 4450, 4380, 5100, 4920, 5300, 5480, 5200, 5350, 5600, 5720, 5580, 5900, 6100, 5950, 6200, 6400,
  6180, 6550, 6720, 6600, 6850, 7020, 6880, 7100, 7350, 7200, 7480, 7650, 7820,
]

/** Flags opened per 1k sessions — weekly points. */
export const adminTrustFlagsSeries: number[] = [2.1, 2.4, 1.9, 2.2, 1.7, 1.8, 1.6, 1.5, 1.4, 1.6, 1.5, 1.3]

export type AdminReportKpi = {
  label: string
  value: string
  hint: string
  hintTone: "muted" | "positive" | "negative"
  emphasis?: boolean
}

export const adminReportKpis: AdminReportKpi[] = [
  {
    label: "GMV (period)",
    value: "$184k",
    hint: "+12.4% vs prior period",
    hintTone: "positive",
    emphasis: true,
  },
  {
    label: "Net take rate",
    value: "11.2%",
    hint: "After promos & credits",
    hintTone: "muted",
  },
  {
    label: "Sessions",
    value: "412k",
    hint: "+3.1% organic / +1.8% paid",
    hintTone: "positive",
  },
  {
    label: "Checkout conversion",
    value: "3.24%",
    hint: "−0.06pp vs last week",
    hintTone: "negative",
  },
]

export type AdminGmvBreakdown = {
  label: string
  amount: number
  tone?: "neutral" | "subtract" | "highlight"
}

export const adminGmvBreakdown: AdminGmvBreakdown[] = [
  { label: "Gross merchandise volume", amount: 184000, tone: "neutral" },
  { label: "Refunds & chargebacks", amount: -8200, tone: "subtract" },
  { label: "Platform fees (net)", amount: 20608, tone: "neutral" },
  { label: "Net to creators (payouts)", amount: 155592, tone: "highlight" },
]

export type AdminFunnelStep = {
  step: string
  count: number
  dropPct: number
}

export const adminConversionFunnel: AdminFunnelStep[] = [
  { step: "Sessions", count: 412000, dropPct: 0 },
  { step: "Product views", count: 186400, dropPct: 55 },
  { step: "Add to cart", count: 42100, dropPct: 77 },
  { step: "Checkout started", count: 14800, dropPct: 65 },
  { step: "Paid orders", count: 13360, dropPct: 10 },
]

export type AdminExportRun = {
  id: string
  name: string
  format: "CSV" | "Parquet" | "PDF"
  rowCount: number
  schedule: "Daily" | "Weekly" | "On demand" | "Monthly"
  lastRun: string
  status: "completed" | "failed" | "running"
  owner: string
}

export const adminExportHistory: AdminExportRun[] = [
  {
    id: "exp-1001",
    name: "Orders_fact_full",
    format: "Parquet",
    rowCount: 2_412_000,
    schedule: "Daily",
    lastRun: "Apr 18, 2026 · 06:12 UTC",
    status: "completed",
    owner: "data-eng",
  },
  {
    id: "exp-1002",
    name: "Trust_flags_weekly",
    format: "CSV",
    rowCount: 18_420,
    schedule: "Weekly",
    lastRun: "Apr 17, 2026 · 09:00 UTC",
    status: "completed",
    owner: "trust-ops",
  },
  {
    id: "exp-1003",
    name: "Creator_payouts_snapshot",
    format: "CSV",
    rowCount: 890,
    schedule: "On demand",
    lastRun: "Apr 18, 2026 · 14:22 UTC",
    status: "running",
    owner: "finance",
  },
  {
    id: "exp-1004",
    name: "Executive_summary_Q1",
    format: "PDF",
    rowCount: 12,
    schedule: "Monthly",
    lastRun: "Apr 1, 2026 · 08:00 UTC",
    status: "completed",
    owner: "exec-staff",
  },
  {
    id: "exp-1005",
    name: "Search_queries_raw",
    format: "Parquet",
    rowCount: 8_900_000,
    schedule: "Daily",
    lastRun: "Apr 16, 2026 · 06:05 UTC",
    status: "failed",
    owner: "product-analytics",
  },
  {
    id: "exp-1006",
    name: "Moderation_queue_audit",
    format: "CSV",
    rowCount: 4_200,
    schedule: "Weekly",
    lastRun: "Apr 14, 2026 · 11:30 UTC",
    status: "completed",
    owner: "trust-ops",
  },
  {
    id: "exp-1007",
    name: "Regional_sessions_rollups",
    format: "Parquet",
    rowCount: 96_000,
    schedule: "Daily",
    lastRun: "Apr 18, 2026 · 05:45 UTC",
    status: "completed",
    owner: "data-eng",
  },
  {
    id: "exp-1008",
    name: "Partner_API_usage",
    format: "CSV",
    rowCount: 124_500,
    schedule: "Daily",
    lastRun: "Apr 17, 2026 · 23:58 UTC",
    status: "completed",
    owner: "platform",
  },
]

export type AdminTopCreatorRow = {
  rank: number
  creatorId: string
  name: string
  gmv: number
  orders: number
  delta: string
}

export const adminTopCreatorsByGmv: AdminTopCreatorRow[] = [
  { rank: 1, creatorId: "myth-weaver", name: "Myth Weaver", gmv: 42800, orders: 312, delta: "+8%" },
  { rank: 2, creatorId: "luna-pixel", name: "Luna Pixel", gmv: 39100, orders: 289, delta: "+3%" },
  { rank: 3, creatorId: "nova-scribe", name: "Nova Scribe", gmv: 36200, orders: 241, delta: "+11%" },
  { rank: 4, creatorId: "echo-art", name: "Echo Art", gmv: 31800, orders: 198, delta: "−2%" },
  { rank: 5, creatorId: "story-sage", name: "Story Sage", gmv: 30500, orders: 176, delta: "+5%" },
]

export type AdminReportTemplate = {
  id: string
  title: string
  description: string
  cadence: string
}

export const adminReportTemplates: AdminReportTemplate[] = [
  {
    id: "tpl-1",
    title: "Weekly business review",
    description: "GMV, orders, cohort retention, and regional split.",
    cadence: "Every Monday 07:00 UTC",
  },
  {
    id: "tpl-2",
    title: "Trust & safety digest",
    description: "Flags, suspensions, chargebacks, and SLA breaches.",
    cadence: "Daily 06:00 UTC",
  },
  {
    id: "tpl-3",
    title: "Creator health",
    description: "Top movers, churn risk, payout failures.",
    cadence: "Monthly · 1st of month",
  },
]
