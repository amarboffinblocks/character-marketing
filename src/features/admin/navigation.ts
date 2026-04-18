import type { AppSidebarGroup } from "@/components/layout/app-sidebar"

export const adminSidebarGroups: AppSidebarGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard/admin", icon: "dashboard" },
      { title: "Reports", href: "/dashboard/admin/reports", icon: "chart" },
    ],
  },
  {
    label: "Platform",
    items: [
      { title: "Users", href: "/dashboard/admin/users", icon: "users", badge: "2.4k" },
      { title: "Creators", href: "/dashboard/admin/creators", icon: "store", badge: "120" },
      { title: "Orders", href: "/dashboard/admin/orders", icon: "orders" },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Profile", href: "/dashboard/admin/profile", icon: "profile" },
      { title: "Settings", href: "/dashboard/admin/settings", icon: "settings" },
    ],
  },
]
