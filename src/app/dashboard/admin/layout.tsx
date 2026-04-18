import { cookies } from "next/headers"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { adminSidebarGroups } from "@/features/admin/navigation"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const sidebarCookie = cookieStore.get("sidebar_state")?.value
  const defaultOpen = sidebarCookie === undefined ? true : sidebarCookie === "true"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar
        groups={adminSidebarGroups}
        workspaceName="Character Market"
        workspaceSubtitle="Admin"
        brandHref="/dashboard/admin"
      />
      <SidebarInset className="bg-background">
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
