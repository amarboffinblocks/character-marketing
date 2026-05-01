import {
  ActionItem,
  ActionRequiredCard,
} from "@/features/creator/dashboard/components/action-required-card"
import { DashboardStatsGrid } from "@/features/creator/dashboard/components/dashboard-stats-grid"
import {
  DeadlineDay,
  DeadlinesStrip,
} from "@/features/creator/dashboard/components/deadlines-strip"
import { EarningsChartCard } from "@/features/creator/dashboard/components/earnings-chart-card"
import {
  MessagePreviewItem,
  MessagesPreviewCard,
} from "@/features/creator/dashboard/components/messages-preview-card"
import { ReviewsSummaryCard } from "@/features/creator/dashboard/components/reviews-summary-card"
import {
  CompletionCheck,
  ProfileCompletionCard,
} from "@/features/creator/dashboard/components/profile-completion-card"
import { QuickActionsCard } from "@/features/creator/dashboard/components/quick-actions-card"
import {
  RecentActivityCard,
  RecentActivityItem,
} from "@/features/creator/dashboard/components/recent-activity-card"
import { SmartHero } from "@/features/creator/dashboard/components/smart-hero"
import {
  WorkspaceHealthCard,
  WorkspaceHealthItem,
} from "@/features/creator/dashboard/components/workspace-health-card"
import {
  creatorDashboardQuickActions,
  creatorDashboardStats,
} from "@/features/creator/dashboard/data"
import type { CreatorDashboardStat } from "@/features/creator/dashboard/types"
import type { CreatorOrderRow } from "@/features/creator/orders/creator-orders"

const earningsSeries = [
  110, 140, 130, 170, 190, 160, 210, 240, 220, 260, 300, 280, 320, 340, 310, 360, 380,
  350, 400, 420, 390, 430, 460, 440, 500, 520, 490, 540, 560, 580,
]

type CreatorDashboardData = {
  creatorName: string
  orders: CreatorOrderRow[]
  workspaceCounts: {
    characters: number
    personas: number
    lorebooks: number
    avatars: number
    backgrounds: number
  }
  draftCharacters: number
  reviewCount: number
  averageRating: number
}

function buyerDisplayName(profileData: unknown) {
  const root = profileData && typeof profileData === "object" ? (profileData as Record<string, unknown>) : null
  const nestedUser = root?.user && typeof root.user === "object" ? (root.user as Record<string, unknown>) : null
  const fromNested =
    (typeof nestedUser?.displayName === "string" && nestedUser.displayName.trim()) ||
    (typeof nestedUser?.name === "string" && nestedUser.name.trim())
  const fromRoot =
    (typeof root?.displayName === "string" && root.displayName.trim()) ||
    (typeof root?.name === "string" && root.name.trim())
  return fromNested || fromRoot || "Buyer"
}

/** Postgres timestamps may arrive as ISO strings or `Date` objects. */
function toIsoDateKey(value: unknown): string {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10)
  }
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10)
  }
  return ""
}

function toActivityStatus(status: CreatorOrderRow["status"]): RecentActivityItem["status"] {
  if (status === "pending_payment") return "new"
  if (status === "in_progress") return "in_progress"
  if (status === "on_hold" || status === "approved") return "waiting_on_buyer"
  if (status === "delivered") return "review"
  return "completed"
}

function buildActionItems(data: CreatorDashboardData): ActionItem[] {
  const items: ActionItem[] = []
  const activeOrders = data.orders.filter((order) => order.status !== "completed" && order.status !== "cancelled")
  const unpaidOrder = activeOrders.find((order) => order.payment_status === "unpaid" || order.status === "pending_payment")
  const blockedOrder = activeOrders.find((order) => order.status === "on_hold" || order.status === "approved")

  if (unpaidOrder) {
    items.push({
      id: `payment-${unpaidOrder.id}`,
      label: `Payment pending: ${unpaidOrder.package_title}`,
      meta: `${buyerDisplayName(unpaidOrder.buyer_profile_data)} · ${unpaidOrder.id}`,
      href: "/dashboard/creator/orders",
      tone: "urgent",
    })
  }

  if (blockedOrder) {
    items.push({
      id: `hold-${blockedOrder.id}`,
      label: `Unblock order: ${blockedOrder.package_title}`,
      meta: `${buyerDisplayName(blockedOrder.buyer_profile_data)} · ${blockedOrder.id}`,
      href: "/dashboard/creator/inbox",
      tone: "warning",
    })
  }

  if (data.draftCharacters > 0) {
    items.push({
      id: "draft-characters",
      label: `Publish ${data.draftCharacters} draft character${data.draftCharacters > 1 ? "s" : ""}`,
      meta: "Workspace · Characters",
      href: "/dashboard/creator/workspace/characters",
      tone: "info",
    })
  }

  return items
}

function buildMessagesPreview(orders: CreatorOrderRow[]): MessagePreviewItem[] {
  return orders.slice(0, 4).map((order) => ({
    id: order.id,
    buyerName: buyerDisplayName(order.buyer_profile_data),
    preview: order.package_title,
    time: new Date(order.updated_at).toLocaleDateString(),
    unread: order.status === "on_hold" || order.status === "pending_payment" || order.payment_status === "unpaid",
  }))
}

function buildRecentActivity(orders: CreatorOrderRow[]): RecentActivityItem[] {
  return orders.slice(0, 5).map((order) => ({
    id: order.id,
    buyerName: buyerDisplayName(order.buyer_profile_data),
    packageName: order.package_title,
    meta: `Updated ${new Date(order.updated_at).toLocaleDateString()}`,
    status: toActivityStatus(order.status),
    href: "/dashboard/creator/orders",
  }))
}

function buildWorkspaceHealth(data: CreatorDashboardData): WorkspaceHealthItem[] {
  return [
    {
      label: "Characters",
      count: data.workspaceCounts.characters,
      href: "/dashboard/creator/workspace/characters",
      icon: "characters",
      imageUrl: "https://picsum.photos/seed/character-card/480/240",
    },
    {
      label: "Personas",
      count: data.workspaceCounts.personas,
      href: "/dashboard/creator/workspace/personas",
      icon: "personas",
      imageUrl: "https://picsum.photos/seed/persona-card/480/240",
    },
    {
      label: "Lorebooks",
      count: data.workspaceCounts.lorebooks,
      href: "/dashboard/creator/workspace/lorebooks",
      icon: "lorebooks",
      imageUrl: "https://picsum.photos/seed/lorebook-card/480/240",
    },
    {
      label: "Avatars",
      count: data.workspaceCounts.avatars,
      href: "/dashboard/creator/workspace/avatars",
      icon: "avatars",
      imageUrl: "https://picsum.photos/seed/avatar-card/480/240",
    },
    {
      label: "Backgrounds",
      count: data.workspaceCounts.backgrounds,
      href: "/dashboard/creator/workspace/backgrounds",
      icon: "backgrounds",
      imageUrl: "https://picsum.photos/seed/background-card/480/240",
    },
  ]
}

function buildDeadlineDays(orders: CreatorOrderRow[]): DeadlineDay[] {
  const today = new Date()
  return Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(today)
    day.setDate(today.getDate() + offset)
    const dayKey = day.toISOString().slice(0, 10)
    const count = orders.filter((order) => toIsoDateKey(order.updated_at) === dayKey).length
    const tone: DeadlineDay["tone"] =
      count === 0 ? "none" : offset <= 1 ? "overdue" : offset <= 3 ? "warning" : "ok"
    return {
      date: String(day.getDate()).padStart(2, "0"),
      weekday: day.toLocaleDateString("en-US", { weekday: "short" }),
      count,
      tone,
    }
  })
}

function buildCompletionChecks(data: CreatorDashboardData): CompletionCheck[] {
  const totalAssets =
    data.workspaceCounts.characters +
    data.workspaceCounts.personas +
    data.workspaceCounts.lorebooks +
    data.workspaceCounts.avatars +
    data.workspaceCounts.backgrounds
  return [
    { label: "Display name set", done: data.creatorName.trim().length > 0 },
    { label: "At least 3 portfolio items", done: totalAssets >= 3 },
    { label: "At least 1 character", done: data.workspaceCounts.characters > 0 },
    { label: "At least 1 persona", done: data.workspaceCounts.personas > 0 },
    { label: "At least 1 avatar", done: data.workspaceCounts.avatars > 0 },
    { label: "At least 1 review", done: data.reviewCount > 0 },
  ]
}

type CreatorDashboardViewProps = {
  dashboardData: CreatorDashboardData
  creatorId?: string
}

function buildDashboardStats(data: CreatorDashboardData): CreatorDashboardStat[] {
  const activeOrders = data.orders.filter((order) => order.status !== "completed" && order.status !== "cancelled").length
  const completedOrders = data.orders.filter((order) => order.status === "completed")
  const earnings30d = completedOrders.reduce((sum, order) => sum + Number(order.package_price ?? 0), 0)
  const responseCount = data.orders.filter(
    (order) => order.status === "on_hold" || order.status === "pending_payment" || order.payment_status === "unpaid"
  ).length

  return creatorDashboardStats.map((stat) => {
    if (stat.label === "Active orders") {
      return {
        ...stat,
        value: String(activeOrders),
        delta: `${responseCount} need attention`,
        trend: responseCount > 0 ? "down" : "up",
      }
    }
    if (stat.label === "Earnings (30d)") {
      return {
        ...stat,
        value: `$${earnings30d.toLocaleString()}`,
        delta: `${completedOrders.length} completed order${completedOrders.length === 1 ? "" : "s"}`,
        trend: completedOrders.length > 0 ? "up" : "neutral",
      }
    }
    if (stat.label === "Rating") {
      return {
        ...stat,
        value: data.averageRating > 0 ? data.averageRating.toFixed(2) : "—",
        delta: `${data.reviewCount} review${data.reviewCount === 1 ? "" : "s"}`,
        trend: data.reviewCount > 0 ? "up" : "neutral",
      }
    }
    return {
      ...stat,
      value: responseCount === 0 ? "On track" : `${responseCount} open`,
      delta: responseCount === 0 ? "No pending conversations" : "Buyer follow-up needed",
      trend: responseCount > 0 ? "down" : "up",
    }
  })
}

export function CreatorDashboardView({ creatorId, dashboardData }: CreatorDashboardViewProps) {
  const dueThisWeek = dashboardData.orders.filter(
    (order) => order.status !== "completed" && order.status !== "cancelled"
  ).length
  const needsResponse = dashboardData.orders.filter(
    (order) => order.status === "on_hold" || order.status === "pending_payment" || order.payment_status === "unpaid"
  ).length
  const draftsPending = dashboardData.draftCharacters

  const actionItems = buildActionItems(dashboardData)
  const messagesPreview = buildMessagesPreview(dashboardData.orders)
  const recentActivity = buildRecentActivity(dashboardData.orders)
  const workspaceHealth = buildWorkspaceHealth(dashboardData)
  const deadlineDays = buildDeadlineDays(dashboardData.orders)
  const completionChecks = buildCompletionChecks(dashboardData)
  const stats = buildDashboardStats(dashboardData)

  return (
    <div className="flex flex-col gap-6">
      <SmartHero
        creatorName={dashboardData.creatorName || "Creator"}
        dueThisWeek={dueThisWeek}
        needsResponse={needsResponse}
        draftsPending={draftsPending}
      />

      <DashboardStatsGrid stats={stats} />

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActionRequiredCard items={actionItems} />
        </div>
        <ProfileCompletionCard checks={completionChecks} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <EarningsChartCard
          earnings={earningsSeries}
          currentTotal={`$${dashboardData.orders
            .filter((order) => order.status === "completed")
            .reduce((sum, order) => sum + Number(order.package_price ?? 0), 0)
            .toLocaleString()}`}
          deltaLabel={`${dashboardData.orders.filter((order) => order.status === "completed").length} completed orders`}
        />
        <QuickActionsCard actions={creatorDashboardQuickActions} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <RecentActivityCard activity={recentActivity} />
        <MessagesPreviewCard items={messagesPreview} />
        <ReviewsSummaryCard creatorId={creatorId} />
      </section>

      <WorkspaceHealthCard items={workspaceHealth} />

      <DeadlinesStrip days={deadlineDays} />
    </div>
  )
}
