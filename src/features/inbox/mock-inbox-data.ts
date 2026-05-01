import type { InboxRole, InboxSystemSeed } from "@/features/inbox/types"

function isoMinutesAgo(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString()
}

const creatorSystemSeeds: InboxSystemSeed[] = [
  {
    userId: "creator",
    category: "request",
    title: "New custom request submitted",
    body: "A buyer submitted a new request for Anime Character Pack.",
    isRead: false,
    actionUrl: "/dashboard/creator/requests",
    createdAt: isoMinutesAgo(10),
  },
  {
    userId: "creator",
    category: "bid",
    title: "Bid assigned to you",
    body: "A buyer assigned a global bid. Review scope and start work.",
    isRead: false,
    actionUrl: "/dashboard/creator/orders",
    createdAt: isoMinutesAgo(45),
  },
  {
    userId: "creator",
    category: "order",
    title: "Order status reminder",
    body: "Update status for an active order to keep buyer informed.",
    isRead: true,
    actionUrl: "/dashboard/creator/orders",
    createdAt: isoMinutesAgo(180),
  },
  {
    userId: "creator",
    category: "payment",
    title: "Payout update available",
    body: "Your latest payout summary is ready for review.",
    isRead: true,
    actionUrl: "/dashboard/creator/earnings",
    createdAt: isoMinutesAgo(320),
  },
]

const buyerSystemSeeds: InboxSystemSeed[] = [
  {
    userId: "buyer",
    category: "request",
    title: "Request accepted",
    body: "A creator accepted your request and started order processing.",
    isRead: false,
    actionUrl: "/orders",
    createdAt: isoMinutesAgo(20),
  },
  {
    userId: "buyer",
    category: "request",
    title: "Request rejected",
    body: "One of your requests was rejected. You can submit revisions.",
    isRead: false,
    actionUrl: "/requests",
    createdAt: isoMinutesAgo(65),
  },
  {
    userId: "buyer",
    category: "order",
    title: "Order status updated",
    body: "A creator moved your order to Processing.",
    isRead: true,
    actionUrl: "/orders",
    createdAt: isoMinutesAgo(210),
  },
  {
    userId: "buyer",
    category: "bid",
    title: "Creator assigned on your bid",
    body: "Your bid now has an assigned creator and active timeline.",
    isRead: true,
    actionUrl: "/post-a-bid",
    createdAt: isoMinutesAgo(420),
  },
]

export function getMockSystemInboxItems(role: InboxRole) {
  const seeds = role === "creator" ? creatorSystemSeeds : buyerSystemSeeds
  return seeds.map((seed, index) => ({
    ...seed,
    id: `system-${role}-${index + 1}`,
    type: "system" as const,
  }))
}
