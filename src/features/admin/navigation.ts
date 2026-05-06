import type { AppSidebarGroup } from "@/components/layout/app-sidebar"

export const adminSidebarGroups: AppSidebarGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Overview", href: "/dashboard/admin", icon: "dashboard" },
      { title: "Reports", href: "/dashboard/admin/reports", icon: "chart" },
    ],
  },
  {
    label: "Directory",
    items: [
      { title: "Users", href: "/dashboard/admin/users", icon: "users" },
      { title: "Creators", href: "/dashboard/admin/creators", icon: "store" },
    ],
  },
]
