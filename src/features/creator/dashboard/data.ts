import { FolderKanban, Sparkles, Star, Wallet } from "lucide-react"

import type {
  CreatorDashboardActivity,
  CreatorDashboardStat,
  CreatorQuickAction,
} from "@/features/creator/dashboard/types"

export const creatorDashboardStats: CreatorDashboardStat[] = [
  {
    label: "Active orders",
    value: "12",
    delta: "+3 this week",
    trend: "up",
    icon: FolderKanban,
  },
  {
    label: "Earnings (30d)",
    value: "$4,280",
    delta: "+18% vs last month",
    trend: "up",
    icon: Wallet,
  },
  {
    label: "Rating",
    value: "4.92",
    delta: "128 reviews",
    trend: "neutral",
    icon: Star,
  },
  {
    label: "Response time",
    value: "42m",
    delta: "-8m this week",
    trend: "up",
    icon: Sparkles,
  },
]

export const creatorDashboardActivity: CreatorDashboardActivity[] = [
  {
    id: "ORD-2941",
    title: "Character pack — Neon City",
    meta: "Ordered 2m ago · $180",
    status: "new",
  },
  {
    id: "ORD-2938",
    title: "Anime OC full-body illustration",
    meta: "Due in 2 days · $240",
    status: "in_progress",
  },
  {
    id: "ORD-2931",
    title: "Pixel mascot set (6 poses)",
    meta: "Delivered yesterday · $320",
    status: "completed",
  },
]

export const creatorDashboardQuickActions: CreatorQuickAction[] = [
  { href: "/dashboard/creator/orders", label: "Review pending orders" },
  { href: "/dashboard/creator/workspace/characters/new", label: "Create a new listing" },
  { href: "/dashboard/creator/profile", label: "Update profile details" },
]
