export type PayoutStatus = "paid" | "pending" | "processing" | "failed"

export type EarningTransaction = {
  id: string
  orderId: string
  buyerName: string
  packageName: string
  amount: number
  fee: number
  net: number
  date: string
  status: PayoutStatus
}

export const creatorEarningsSeries = [
  120, 150, 140, 180, 210, 230, 200, 260, 290, 270, 310, 340, 320, 360, 400, 380, 430,
  460, 440, 500, 520, 490, 560, 590, 560, 620, 650, 610, 680, 720,
]

export const payoutHistory: EarningTransaction[] = [
  {
    id: "txn-1",
    orderId: "ORD-3021",
    buyerName: "Ava Thompson",
    packageName: "Character Premium Package",
    amount: 240,
    fee: 24,
    net: 216,
    date: "Apr 17, 2026",
    status: "pending",
  },
  {
    id: "txn-2",
    orderId: "ORD-3008",
    buyerName: "Mia Robinson",
    packageName: "Avatar Starter Pack",
    amount: 140,
    fee: 14,
    net: 126,
    date: "Apr 16, 2026",
    status: "processing",
  },
  {
    id: "txn-3",
    orderId: "ORD-2985",
    buyerName: "Sophia Martin",
    packageName: "Brand mascot concept",
    amount: 320,
    fee: 32,
    net: 288,
    date: "Apr 12, 2026",
    status: "paid",
  },
  {
    id: "txn-4",
    orderId: "ORD-2971",
    buyerName: "Olivia Chen",
    packageName: "Character + Persona",
    amount: 260,
    fee: 26,
    net: 234,
    date: "Apr 10, 2026",
    status: "paid",
  },
  {
    id: "txn-5",
    orderId: "ORD-2965",
    buyerName: "James Walker",
    packageName: "Retro pixel hero sprite kit",
    amount: 78,
    fee: 8,
    net: 70,
    date: "Apr 05, 2026",
    status: "paid",
  },
  {
    id: "txn-6",
    orderId: "ORD-2944",
    buyerName: "Liam Garcia",
    packageName: "Fantasy turnaround sheet",
    amount: 180,
    fee: 18,
    net: 162,
    date: "Mar 30, 2026",
    status: "failed",
  },
]

export function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}
