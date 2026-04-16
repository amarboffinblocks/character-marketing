import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { creatorSidebarGroups } from "@/features/creator/navigation"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar groups={creatorSidebarGroups} />
      <SidebarInset>
        <div className="flex-1 px-6 pb-6  ">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
