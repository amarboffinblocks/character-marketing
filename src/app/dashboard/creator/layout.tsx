import { cookies } from "next/headers"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { creatorSidebarGroups } from "@/features/creator/navigation"

export default async function CreatorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Persist the sidebar open/collapsed state across navigations.
  const cookieStore = await cookies()
  const sidebarCookie = cookieStore.get("sidebar_state")?.value
  const defaultOpen = sidebarCookie === undefined ? true : sidebarCookie === "true"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar groups={creatorSidebarGroups} />
      <SidebarInset className="bg-background">
        <DashboardHeader showSearch={false} />
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
