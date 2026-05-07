import type { AppSidebarGroup } from "@/components/layout/app-sidebar"

export const adminSidebarGroups: AppSidebarGroup[] = [
  {
    label: "Communication",
    items: [
      { title: "Overview", href: "/dashboard/admin", icon: "dashboard" },
      { title: "Notifications", href: "/dashboard/admin/notifications", icon: "bell" },
      { title: "Messages", href: "/dashboard/admin/messages", icon: "messages" },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Orders", href: "/dashboard/admin/orders", icon: "orders" },
      { title: "Reports", href: "/dashboard/admin/reports", icon: "chart" },
      { title: "Transactions", href: "/dashboard/admin/transactions", icon: "wallet" },
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
