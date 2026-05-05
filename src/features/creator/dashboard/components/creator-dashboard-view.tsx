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
import type {
  CreatorQuickAction,
  CreatorDashboardStat,
} from "@/features/creator/dashboard/types"
import type { CreatorOrderRow } from "@/features/creator/orders/creator-orders"

function buildEarningsSeries(orders: CreatorOrderRow[]): number[] {
  const series = new Array(30).fill(0)
  const today = new Date()
  
  orders.forEach((order) => {
    if (order.status !== "completed" || !order.updated_at) return
    
    const orderDate = new Date(order.updated_at)
    const diffTime = today.getTime() - orderDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    // We want index 29 to be today (diffDays = 0), index 0 to be 29 days ago.
    if (diffDays >= 0 && diffDays < 30) {
      const index = 29 - diffDays
      if (index >= 0 && index < 30) {
         series[index] += Number(order.package_price ?? 0)
      }
    }
  })
  
  return series
}

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
  creatorProfile?: Record<string, any>
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
  if (status === "on_hold" || status === "approved" || status === "reviewing") return "waiting_on_buyer"
  if (status === "delivered") return "review"
  return "completed"
}

function buildActionItems(data: CreatorDashboardData): ActionItem[] {
  const items: ActionItem[] = []
  const activeOrders = data.orders.filter((order) => order.status !== "completed" && order.status !== "cancelled")
  const unpaidOrder = activeOrders.find((order) => order.payment_status === "unpaid" || order.status === "pending_payment")
  const blockedOrder = activeOrders.find(
    (order) => order.status === "on_hold" || order.status === "approved" || order.status === "reviewing"
  )

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
      href: "/dashboard/creator/messages",
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

function buildQuickActions(data: CreatorDashboardData): CreatorQuickAction[] {
  const actions: CreatorQuickAction[] = []
  
  const activeOrders = data.orders.filter((o) => o.status !== "completed" && o.status !== "cancelled").length

  if (activeOrders > 0) {
    actions.push({ href: "/dashboard/creator/orders", label: `Review ${activeOrders} pending orders` })
  } else {
    actions.push({ href: "/dashboard/creator/orders", label: "View order history" })
  }

  const totalAssets = 
    data.workspaceCounts.characters + 
    data.workspaceCounts.personas + 
    data.workspaceCounts.lorebooks + 
    data.workspaceCounts.avatars + 
    data.workspaceCounts.backgrounds

  if (totalAssets === 0) {
    actions.push({ href: "/dashboard/creator/workspace/characters/new", label: "Create your first listing" })
  } else {
    actions.push({ href: "/dashboard/creator/workspace/characters/new", label: "Create a new listing" })
  }

  actions.push({ href: "/dashboard/creator/profile", label: "Update profile details" })

  return actions
}

function buildMessagesPreview(orders: CreatorOrderRow[]): MessagePreviewItem[] {
  return orders.slice(0, 4).map((order) => ({
    id: order.id,
    buyerName: buyerDisplayName(order.buyer_profile_data),
    preview: order.package_title,
    time: new Date(order.updated_at).toLocaleDateString(),
    unread:
      order.status === "on_hold" ||
      order.status === "reviewing" ||
      order.status === "pending_payment" ||
      order.payment_status === "unpaid",
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
    },
    {
      label: "Personas",
      count: data.workspaceCounts.personas,
      href: "/dashboard/creator/workspace/personas",
      icon: "personas",
    },
    {
      label: "Lorebooks",
      count: data.workspaceCounts.lorebooks,
      href: "/dashboard/creator/workspace/lorebooks",
      icon: "lorebooks",
    },
    {
      label: "Avatars",
      count: data.workspaceCounts.avatars,
      href: "/dashboard/creator/workspace/avatars",
      icon: "avatars",
    },
    {
      label: "Backgrounds",
      count: data.workspaceCounts.backgrounds,
      href: "/dashboard/creator/workspace/backgrounds",
      icon: "backgrounds",
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
  const profile = data.creatorProfile || {}
  const skills = Array.isArray(profile.skills) ? profile.skills : []
  const languages = Array.isArray(profile.languages) ? profile.languages : []
  const socialLinks = Array.isArray(profile.socialLinks) ? profile.socialLinks : []
  
  // Total assets from workspace tables
  const workspaceAssets = 
    data.workspaceCounts.characters + 
    data.workspaceCounts.personas + 
    data.workspaceCounts.lorebooks + 
    data.workspaceCounts.avatars + 
    data.workspaceCounts.backgrounds
    
  // Manual portfolio items from profile data
  const manualPortfolio = Array.isArray(profile.portfolio) ? profile.portfolio : []
  
  const totalPortfolioCount = Math.max(workspaceAssets, manualPortfolio.length)

  return [
    { label: "Display name", done: (profile.displayName || "").trim().length > 0 },
    { label: "Tagline", done: (profile.tagline || "").trim().length > 5 },
    { label: "Short bio", done: (profile.shortBio || "").trim().length > 10 },
    { label: "Avatar image", done: Boolean(profile.avatarUrl) },
    { label: "Banner image", done: Boolean(profile.bannerUrl) },
    { label: "3+ skills", done: skills.length >= 3 },
    { label: "Language", done: languages.length >= 1 },
    { label: "3+ portfolio items", done: totalPortfolioCount >= 3 },
    { label: "Social link", done: socialLinks.length >= 1 },
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
    (order) =>
      order.status === "on_hold" ||
      order.status === "reviewing" ||
      order.status === "pending_payment" ||
      order.payment_status === "unpaid"
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
    (order) =>
      order.status === "on_hold" ||
      order.status === "reviewing" ||
      order.status === "pending_payment" ||
      order.payment_status === "unpaid"
  ).length
  const draftsPending = dashboardData.draftCharacters

  const actionItems = buildActionItems(dashboardData)
  const messagesPreview = buildMessagesPreview(dashboardData.orders)
  const recentActivity = buildRecentActivity(dashboardData.orders)
  const workspaceHealth = buildWorkspaceHealth(dashboardData)
  const deadlineDays = buildDeadlineDays(dashboardData.orders)
  const stats = buildDashboardStats(dashboardData)
  const dynamicEarningsSeries = buildEarningsSeries(dashboardData.orders)
  const dynamicQuickActions = buildQuickActions(dashboardData)

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
        <QuickActionsCard actions={dynamicQuickActions} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <EarningsChartCard
            earnings={dynamicEarningsSeries}
            currentTotal={`$${dashboardData.orders
              .filter((order) => order.status === "completed")
              .reduce((sum, order) => sum + Number(order.package_price ?? 0), 0)
              .toLocaleString()}`}
            deltaLabel={`${dashboardData.orders.filter((order) => order.status === "completed").length} completed orders`}
          />
        </div>
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
