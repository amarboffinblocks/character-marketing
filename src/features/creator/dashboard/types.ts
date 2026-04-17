import type { LucideIcon } from "lucide-react"

export type CreatorDashboardStat = {
  label: string
  value: string
  delta: string
  trend: "up" | "down" | "neutral"
  icon: LucideIcon
}

export type CreatorDashboardActivity = {
  id: string
  title: string
  meta: string
  status: "new" | "in_progress" | "completed"
}

export type CreatorQuickAction = {
  href: string
  label: string
}
