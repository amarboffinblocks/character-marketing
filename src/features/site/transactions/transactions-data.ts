export type TransactionStatus = "completed" | "pending" | "rejected"

export type SiteTransaction = {
  id: string
  label: string
  amountCents: number
  creatorName: string
  creatorHandle: string
  status: TransactionStatus
  createdAt: string
  /** When money settled (completed) or last update (pending) */
  updatedAt: string
  settledAt?: string
  /** Shown for rejected */
  reason?: string
}

export const siteTransactions: SiteTransaction[] = [
  {
    id: "TXN-9042",
    label: "Character card — cinematic OC bundle",
    amountCents: 4500,
    creatorName: "Luna Pixel",
    creatorHandle: "@lunapixel",
    status: "completed",
    createdAt: "Apr 10, 2026",
    updatedAt: "Apr 11, 2026",
    settledAt: "Apr 11, 2026",
  },
  {
    id: "TXN-9038",
    label: "Lorebook — Crimson Harbor extended",
    amountCents: 12000,
    creatorName: "Nova Scribe",
    creatorHandle: "@novascribe",
    status: "completed",
    createdAt: "Apr 2, 2026",
    updatedAt: "Apr 4, 2026",
    settledAt: "Apr 4, 2026",
  },
  {
    id: "TXN-9031",
    label: "VTuber avatar portrait set",
    amountCents: 8900,
    creatorName: "Echo Art",
    creatorHandle: "@echoart",
    status: "pending",
    createdAt: "Apr 16, 2026",
    updatedAt: "Apr 17, 2026",
  },
  {
    id: "TXN-9027",
    label: "Persona pack — cyber noir narrator",
    amountCents: 3200,
    creatorName: "Aria Writes",
    creatorHandle: "@ariawrites",
    status: "pending",
    createdAt: "Apr 17, 2026",
    updatedAt: "Apr 17, 2026",
  },
  {
    id: "TXN-9019",
    label: "Background scene — neon alley",
    amountCents: 2100,
    creatorName: "Zephyr Studio",
    creatorHandle: "@zephyrstudio",
    status: "rejected",
    createdAt: "Apr 8, 2026",
    updatedAt: "Apr 8, 2026",
    reason: "Payment declined by issuer",
  },
  {
    id: "TXN-9014",
    label: "Commission hold — custom package",
    amountCents: 15000,
    creatorName: "Luna Pixel",
    creatorHandle: "@lunapixel",
    status: "rejected",
    createdAt: "Mar 29, 2026",
    updatedAt: "Mar 29, 2026",
    reason: "Buyer cancelled before capture",
  },
  {
    id: "TXN-9009",
    label: "Character card — fantasy turnaround",
    amountCents: 6800,
    creatorName: "Nova Scribe",
    creatorHandle: "@novascribe",
    status: "completed",
    createdAt: "Mar 20, 2026",
    updatedAt: "Mar 22, 2026",
    settledAt: "Mar 22, 2026",
  },
  {
    id: "TXN-9003",
    label: "Lorebook entries — neon district",
    amountCents: 5500,
    creatorName: "Echo Art",
    creatorHandle: "@echoart",
    status: "pending",
    createdAt: "Apr 18, 2026",
    updatedAt: "Apr 18, 2026",
  },
]

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function formatTransactionAmount(cents: number) {
  return money.format(cents / 100)
}

export function filterTransactions(
  items: SiteTransaction[],
  tab: "all" | TransactionStatus
): SiteTransaction[] {
  if (tab === "all") return items
  return items.filter((t) => t.status === tab)
}

export function transactionStats(items: SiteTransaction[]) {
  const completed = items.filter((t) => t.status === "completed")
  const pending = items.filter((t) => t.status === "pending")
  const rejected = items.filter((t) => t.status === "rejected")
  const completedVolume = completed.reduce((sum, t) => sum + t.amountCents, 0)
  const pendingVolume = pending.reduce((sum, t) => sum + t.amountCents, 0)

  return {
    completedCount: completed.length,
    pendingCount: pending.length,
    rejectedCount: rejected.length,
    completedVolumeCents: completedVolume,
    pendingVolumeCents: pendingVolume,
  }
}
