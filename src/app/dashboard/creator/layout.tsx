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
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur">
          <SidebarTrigger />
          <SidebarSeparator orientation="vertical" className="h-4" />
          <div>
            <p className="text-sm font-medium">Creator Dashboard</p>
            <p className="text-xs text-muted-foreground">
              Manage orders, storefront, and earnings
            </p>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
