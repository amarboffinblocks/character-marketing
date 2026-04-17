import type { AppSidebarGroup } from "@/components/layout/app-sidebar"

export const creatorSidebarGroups: AppSidebarGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard/creator", icon: "dashboard" },
      { title: "Orders", href: "/dashboard/creator/orders", icon: "orders", badge: "12" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Workspace Home", href: "/dashboard/creator/workspace", icon: "services" },
      { title: "Characters", href: "/dashboard/creator/workspace/characters", icon: "profile" },
      { title: "Personas", href: "/dashboard/creator/workspace/personas", icon: "profile" },
      { title: "Lorebooks", href: "/dashboard/creator/workspace/lorebooks", icon: "reviews" },
      { title: "Avatars", href: "/dashboard/creator/workspace/avatars", icon: "earnings" },
      { title: "Backgrounds", href: "/dashboard/creator/workspace/backgrounds", icon: "earnings" },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Messages", href: "/dashboard/creator/messages", icon: "messages" },
      { title: "Services", href: "/dashboard/creator/services", icon: "services" },
    ],
  },
  {
    label: "Performance",
    items: [
      { title: "Reviews", href: "/dashboard/creator/reviews", icon: "reviews" },
      { title: "Earnings", href: "/dashboard/creator/earnings", icon: "earnings" },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Profile", href: "/dashboard/creator/profile", icon: "profile" },
      { title: "Settings", href: "/dashboard/creator/settings", icon: "settings" },
    ],
  },
]
