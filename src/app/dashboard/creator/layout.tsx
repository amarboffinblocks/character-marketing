import { AppSidebar } from "@/components/layout/app-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { creatorSidebarGroups } from "@/features/creator/navigation"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar groups={creatorSidebarGroups} />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
