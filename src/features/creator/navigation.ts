import type { AppSidebarGroup } from "@/components/layout/app-sidebar"

export const creatorSidebarGroups: AppSidebarGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard/creator", icon: "dashboard" },
      { title: "Orders", href: "/dashboard/creator/orders", icon: "orders", badge: "12" },
    ],
  },
]
