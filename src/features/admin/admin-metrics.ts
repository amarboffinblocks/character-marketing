import { OrderStatus } from "@prisma/client"

import type { AdminActivityRow } from "@/features/admin/admin-dashboard-data"
import type { AdminTopCreatorRow } from "@/features/admin/admin-reports-data"
import { prisma } from "@/lib/prisma"

const TERMINAL_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.completed,
  OrderStatus.cancelled,
  OrderStatus.refunded,
]

function pctChangeHint(current: number, previous: number): { trend: "up" | "down" | "neutral"; text: string } {
  if (previous <= 0 && current <= 0) return { trend: "neutral", text: "No prior-period GMV" }
  if (previous <= 0) return { trend: "up", text: "First GMV in prior window" }
  const pct = ((current - previous) / previous) * 100
  const rounded = Math.round(pct * 10) / 10
  if (Math.abs(rounded) < 0.05) return { trend: "neutral", text: "Flat vs prior 30 days" }
  return rounded > 0
    ? { trend: "up", text: `+${rounded}% vs prior 30 days` }
    : { trend: "down", text: `${rounded}% vs prior 30 days` }
}

function formatRelativeAgo(date: Date): string {
  const sec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (sec < 45) return "just now"
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function humanizeOrderStatus(status: OrderStatus): string {
  return status.replace(/_/g, " ")
}

function buildLast30DailyGmv(orders: { createdAt: Date; packagePrice: number }[]): number[] {
  const days = 30
  const byDay = new Map<string, number>()
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10)
    byDay.set(key, (byDay.get(key) ?? 0) + o.packagePrice)
  }
  const out: number[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setUTCHours(0, 0, 0, 0)
    d.setUTCDate(d.getUTCDate() - i)
    const key = d.toISOString().slice(0, 10)
    out.push(byDay.get(key) ?? 0)
  }
  return out
}

function creatorDisplayName(profileData: unknown, id: string): string {
  const root = profileData && typeof profileData === "object" ? (profileData as Record<string, unknown>) : null
  const nested =
    root?.creator && typeof root.creator === "object" ? (root.creator as Record<string, unknown>) : null
  const fromNested =
    (typeof nested?.displayName === "string" && nested.displayName.trim()) ||
    (typeof nested?.name === "string" && nested.name.trim())
  if (fromNested) return fromNested
  const fromRoot =
    (typeof root?.displayName === "string" && root.displayName.trim()) ||
    (typeof root?.name === "string" && root.name.trim())
  if (fromRoot) return fromRoot
  return `Creator ${id.slice(0, 8)}`
}

export type AdminDashboardLiveMetrics = {
  buyerAdminCount: number
  creatorCount: number
  buyersJoined7d: number
  buyersJoinedPrior7d: number
  creatorsJoined7d: number
  creatorsJoinedPrior7d: number
  openOrdersCount: number
  ordersNeedingAttention: number
  gmv30dUsd: number
  gmvPrev30dUsd: number
  recentActivity: AdminActivityRow[]
}

export type AdminReportsLiveMetrics = {
  gmv30dUsd: number
  gmvPrev30dUsd: number
  gmvHint: { trend: "up" | "down" | "neutral"; text: string }
  completedOrders30d: number
  dailyGmvUsd: number[]
  topCreators: AdminTopCreatorRow[]
}

const emptyDashboard: AdminDashboardLiveMetrics = {
  buyerAdminCount: 0,
  creatorCount: 0,
  buyersJoined7d: 0,
  buyersJoinedPrior7d: 0,
  creatorsJoined7d: 0,
  creatorsJoinedPrior7d: 0,
  openOrdersCount: 0,
  ordersNeedingAttention: 0,
  gmv30dUsd: 0,
  gmvPrev30dUsd: 0,
  recentActivity: [],
}

export async function fetchAdminDashboardLiveMetrics(): Promise<AdminDashboardLiveMetrics> {
  try {
    const now = new Date()
    const sevenAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    const thirtyAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const [
      buyerAdminCount,
      creatorCount,
      buyersJoined7d,
      buyersJoinedPrior7d,
      creatorsJoined7d,
      creatorsJoinedPrior7d,
      openOrdersCount,
      ordersNeedingAttention,
      gmvAgg,
      gmvPrevAgg,
      recentOrders,
    ] = await Promise.all([
      prisma.profile.count({ where: { NOT: { role: "creator" } } }),
      prisma.profile.count({ where: { role: "creator" } }),
      prisma.profile.count({
        where: { NOT: { role: "creator" }, created_at: { gte: sevenAgo } },
      }),
      prisma.profile.count({
        where: {
          NOT: { role: "creator" },
          created_at: { gte: fourteenAgo, lt: sevenAgo },
        },
      }),
      prisma.profile.count({
        where: { role: "creator", created_at: { gte: sevenAgo } },
      }),
      prisma.profile.count({
        where: { role: "creator", created_at: { gte: fourteenAgo, lt: sevenAgo } },
      }),
      prisma.order.count({
        where: { NOT: { status: { in: TERMINAL_ORDER_STATUSES } } },
      }),
      prisma.order.count({
        where: {
          OR: [{ status: OrderStatus.pending_payment }, { status: OrderStatus.approved }],
        },
      }),
      prisma.order.aggregate({
        where: {
          status: OrderStatus.completed,
          createdAt: { gte: thirtyAgo },
        },
        _sum: { packagePrice: true },
      }),
      prisma.order.aggregate({
        where: {
          status: OrderStatus.completed,
          createdAt: { gte: sixtyAgo, lt: thirtyAgo },
        },
        _sum: { packagePrice: true },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          packageTitle: true,
          status: true,
          updatedAt: true,
        },
      }),
    ])

    const gmv30 = gmvAgg._sum.packagePrice ?? 0
    const gmvPrev = gmvPrevAgg._sum.packagePrice ?? 0

    const recentActivity: AdminActivityRow[] = recentOrders.map((o) => ({
      id: o.id,
      label: `Order · ${humanizeOrderStatus(o.status)}`,
      meta: o.packageTitle,
      time: formatRelativeAgo(o.updatedAt),
    }))

    return {
      buyerAdminCount,
      creatorCount,
      buyersJoined7d,
      buyersJoinedPrior7d,
      creatorsJoined7d,
      creatorsJoinedPrior7d,
      openOrdersCount,
      ordersNeedingAttention,
      gmv30dUsd: gmv30,
      gmvPrev30dUsd: gmvPrev,
      recentActivity,
    }
  } catch {
    return emptyDashboard
  }
}

export async function fetchAdminReportsLiveMetrics(): Promise<AdminReportsLiveMetrics> {
  try {
    const now = new Date()
    const thirtyAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const [completedLast30, gmvPrevAgg, completedCount, grouped] = await Promise.all([
      prisma.order.findMany({
        where: { status: OrderStatus.completed, createdAt: { gte: thirtyAgo } },
        select: { createdAt: true, packagePrice: true },
      }),
      prisma.order.aggregate({
        where: {
          status: OrderStatus.completed,
          createdAt: { gte: sixtyAgo, lt: thirtyAgo },
        },
        _sum: { packagePrice: true },
      }),
      prisma.order.count({
        where: { status: OrderStatus.completed, createdAt: { gte: thirtyAgo } },
      }),
      prisma.order.groupBy({
        by: ["creatorId"],
        where: { status: OrderStatus.completed, createdAt: { gte: thirtyAgo } },
        _sum: { packagePrice: true },
        _count: { id: true },
      }),
    ])

    const gmv30 = completedLast30.reduce((a, o) => a + o.packagePrice, 0)
    const gmvPrev = gmvPrevAgg._sum.packagePrice ?? 0
    const dailyGmvUsd = buildLast30DailyGmv(completedLast30)

    const sortedGroups = [...grouped]
      .map((g) => ({
        creatorId: g.creatorId,
        gmv: g._sum.packagePrice ?? 0,
        orders: g._count.id,
      }))
      .sort((a, b) => b.gmv - a.gmv)
      .slice(0, 5)

    const creatorIds = sortedGroups.map((g) => g.creatorId)
    const profiles =
      creatorIds.length > 0
        ? await prisma.profile.findMany({
            where: { id: { in: creatorIds } },
            select: { id: true, profileData: true },
          })
        : []
    const nameById = new Map(profiles.map((p) => [p.id, creatorDisplayName(p.profileData, p.id)]))

    const topCreators: AdminTopCreatorRow[] = sortedGroups.map((row, i) => ({
      rank: i + 1,
      creatorId: row.creatorId,
      name: nameById.get(row.creatorId) ?? `Creator ${row.creatorId.slice(0, 8)}`,
      gmv: row.gmv,
      orders: row.orders,
      delta: "—",
    }))

    return {
      gmv30dUsd: gmv30,
      gmvPrev30dUsd: gmvPrev,
      gmvHint: pctChangeHint(gmv30, gmvPrev),
      completedOrders30d: completedCount,
      dailyGmvUsd,
      topCreators,
    }
  } catch {
    return {
      gmv30dUsd: 0,
      gmvPrev30dUsd: 0,
      gmvHint: { trend: "neutral", text: "Unable to load live metrics" },
      completedOrders30d: 0,
      dailyGmvUsd: [],
      topCreators: [],
    }
  }
}
