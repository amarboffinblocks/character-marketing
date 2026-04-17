import { AppSidebar } from "@/components/layout/app-sidebar"
import { CreatorDashboardTopBar } from "@/components/layout/creator-dashboard-top-bar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { creatorSidebarGroups } from "@/features/creator/navigation"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar groups={creatorSidebarGroups} />
      <SidebarInset className="flex min-h-0 flex-1 flex-col">
        <CreatorDashboardTopBar />
        <div className="flex-1 px-4 pb-8 pt-4 md:px-6 md:pt-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
