import {
  creatorDashboardActivity,
  creatorDashboardStats,
  creatorQuickActions,
} from "@/features/creator/dashboard/data"
import { DashboardHero } from "@/features/creator/dashboard/components/dashboard-hero"
import { DashboardStatsGrid } from "@/features/creator/dashboard/components/dashboard-stats-grid"
import { QuickActionsCard } from "@/features/creator/dashboard/components/quick-actions-card"
import { RecentActivityCard } from "@/features/creator/dashboard/components/recent-activity-card"

export function CreatorDashboardView() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHero />
      <DashboardStatsGrid stats={creatorDashboardStats} />
      <section className="grid gap-4 lg:grid-cols-3">
        <RecentActivityCard activity={creatorDashboardActivity} />
        <QuickActionsCard actions={creatorQuickActions} />
      </section>
    </div>
  )
}
