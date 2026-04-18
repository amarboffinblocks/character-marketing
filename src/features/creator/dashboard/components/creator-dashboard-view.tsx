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
  creatorDashboardStats,
  creatorQuickActions,
} from "@/features/creator/dashboard/data"
import { creatorMessageThreads } from "@/features/creator/messages/messages-data"
import { creatorOrders } from "@/features/creator/orders/data"
import { getOrderSummaryMetrics } from "@/features/creator/orders/utils"
import { creatorAvatars } from "@/features/creator/workspace/avatars/avatars-data"
import { creatorBackgrounds } from "@/features/creator/workspace/backgrounds/backgrounds-data"
import { creatorCharacters } from "@/features/creator/workspace/characters/characters-data"
import { creatorLorebooks } from "@/features/creator/workspace/lorebooks/lorebooks-data"
import { creatorPersonas } from "@/features/creator/workspace/personas/personas-data"

const earningsSeries = [
  110, 140, 130, 170, 190, 160, 210, 240, 220, 260, 300, 280, 320, 340, 310, 360, 380,
  350, 400, 420, 390, 430, 460, 440, 500, 520, 490, 540, 560, 580,
]

function buildActionItems(): ActionItem[] {
  const items: ActionItem[] = []

  const overdue = creatorOrders.find((order) => {
    const due = new Date(order.dueDateTime).getTime()
    return due < Date.now() && order.status !== "completed"
  })
  if (overdue) {
    items.push({
      id: `overdue-${overdue.id}`,
      label: `Overdue: ${overdue.packageName}`,
      meta: `${overdue.customerName} · ${overdue.id}`,
      href: `/dashboard/creator/orders/${overdue.id}`,
      tone: "urgent",
    })
  }

  const needsResponseOrder = creatorOrders.find((order) => order.needsResponse)
  if (needsResponseOrder) {
    items.push({
      id: `respond-${needsResponseOrder.id}`,
      label: `Reply to ${needsResponseOrder.customerName}`,
      meta: `${needsResponseOrder.packageName} · ${needsResponseOrder.id}`,
      href: "/dashboard/creator/messages",
      tone: "warning",
    })
  }

  const draftCharacter = creatorCharacters.find((item) => item.status === "draft")
  if (draftCharacter) {
    items.push({
      id: `draft-${draftCharacter.id}`,
      label: `Publish draft: ${draftCharacter.characterName}`,
      meta: "Workspace · Characters",
      href: "/dashboard/creator/workspace/characters",
      tone: "info",
    })
  }

  return items
}

function buildMessagesPreview(): MessagePreviewItem[] {
  return creatorMessageThreads.slice(0, 4).map((thread) => ({
    id: thread.id,
    buyerName: thread.buyerName,
    preview: thread.messages.at(-1)?.text ?? thread.packageName,
    time: thread.lastMessageAt,
    unread: thread.unreadCount > 0,
  }))
}

function buildRecentActivity(): RecentActivityItem[] {
  return creatorOrders.slice(0, 5).map((order) => ({
    id: order.id,
    buyerName: order.customerName,
    packageName: order.packageName,
    meta: `Due ${order.dueDate}`,
    status: order.status,
    href: `/dashboard/creator/orders/${order.id}`,
  }))
}

function buildWorkspaceHealth(): WorkspaceHealthItem[] {
  return [
    {
      label: "Characters",
      count: creatorCharacters.length,
      href: "/dashboard/creator/workspace/characters",
      icon: "characters",
      imageUrl: "https://picsum.photos/seed/character-card/480/240",
    },
    {
      label: "Personas",
      count: creatorPersonas.length,
      href: "/dashboard/creator/workspace/personas",
      icon: "personas",
      imageUrl: "https://picsum.photos/seed/persona-card/480/240",
    },
    {
      label: "Lorebooks",
      count: creatorLorebooks.length,
      href: "/dashboard/creator/workspace/lorebooks",
      icon: "lorebooks",
      imageUrl: "https://picsum.photos/seed/lorebook-card/480/240",
    },
    {
      label: "Avatars",
      count: creatorAvatars.length,
      href: "/dashboard/creator/workspace/avatars",
      icon: "avatars",
      imageUrl: "https://picsum.photos/seed/avatar-card/480/240",
    },
    {
      label: "Backgrounds",
      count: creatorBackgrounds.length,
      href: "/dashboard/creator/workspace/backgrounds",
      icon: "backgrounds",
      imageUrl: "https://picsum.photos/seed/background-card/480/240",
    },
  ]
}

function buildDeadlineDays(): DeadlineDay[] {
  const today = new Date()
  return Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(today)
    day.setDate(today.getDate() + offset)
    const dayKey = day.toISOString().slice(0, 10)
    const count = creatorOrders.filter((order) => order.dueDateTime.slice(0, 10) === dayKey).length
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

function buildCompletionChecks(): CompletionCheck[] {
  return [
    { label: "Display name set", done: true },
    { label: "Bio & tagline filled", done: true },
    { label: "Skills & languages added", done: true },
    { label: "At least 3 portfolio items", done: creatorCharacters.length >= 3 },
    { label: "Social links added", done: true },
    { label: "Services published", done: false },
  ]
}

export function CreatorDashboardView() {
  const { dueThisWeek } = getOrderSummaryMetrics(creatorOrders)
  const needsResponse = creatorOrders.filter((order) => order.needsResponse).length
  const draftsPending = creatorCharacters.filter((item) => item.status === "draft").length

  const actionItems = buildActionItems()
  const messagesPreview = buildMessagesPreview()
  const recentActivity = buildRecentActivity()
  const workspaceHealth = buildWorkspaceHealth()
  const deadlineDays = buildDeadlineDays()
  const completionChecks = buildCompletionChecks()

  return (
    <div className="flex flex-col gap-6">
      <SmartHero
        creatorName="Creator"
        dueThisWeek={dueThisWeek}
        needsResponse={needsResponse}
        draftsPending={draftsPending}
      />

      <DashboardStatsGrid stats={creatorDashboardStats} />

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActionRequiredCard items={actionItems} />
        </div>
        <ProfileCompletionCard checks={completionChecks} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <EarningsChartCard
          earnings={earningsSeries}
          currentTotal="$4,280"
          deltaLabel="+18% vs last month"
        />
        <QuickActionsCard actions={creatorQuickActions} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <RecentActivityCard activity={recentActivity} />
        <MessagesPreviewCard items={messagesPreview} />
      </section>

      <WorkspaceHealthCard items={workspaceHealth} />

      <DeadlinesStrip days={deadlineDays} />
    </div>
  )
}
