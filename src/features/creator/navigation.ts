import type { AppSidebarGroup } from "@/components/layout/app-sidebar"

export const creatorSidebarGroups: AppSidebarGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard/creator", icon: "dashboard" },
      { title: "Orders", href: "/dashboard/creator/orders", icon: "orders", badge: "12" },
      { title: "Messages", href: "/dashboard/creator/messages", icon: "messages", badge: "5" },
    ],
  },
  {
    label: "Storefront",
    items: [
      { title: "Services", href: "/dashboard/creator/services", icon: "services" },
      { title: "Profile", href: "/dashboard/creator/profile", icon: "profile" },
      { title: "Reviews", href: "/dashboard/creator/reviews", icon: "reviews" },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Earnings", href: "/dashboard/creator/earnings", icon: "earnings" },
      { title: "Settings", href: "/dashboard/creator/settings", icon: "settings" },
    ],
  },
]
