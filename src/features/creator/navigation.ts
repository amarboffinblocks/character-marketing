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
    label: "Operations",
    items: [
      { title: "Messages", href: "/dashboard/creator/messages", icon: "messages" },
      { title: "Services", href: "/dashboard/creator/services", icon: "services" },
      { title: "Profile", href: "/dashboard/creator/profile", icon: "profile" },
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
      { title: "Settings", href: "/dashboard/creator/settings", icon: "settings" },
    ],
  },
]
