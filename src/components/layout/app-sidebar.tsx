"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Bell,
    BriefcaseBusiness,
    FolderKanban,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Settings,
    Sparkles,
    Star,
    Wallet,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar"

export type AppSidebarItem = {
    title: string
    href: string
    icon: AppSidebarIconName
    badge?: string
}

export type AppSidebarGroup = {
    label: string
    items: AppSidebarItem[]
}

type AppSidebarProps = {
    groups?: AppSidebarGroup[]
    workspaceName?: string
    workspaceSubtitle?: string
}

const sidebarIcons = {
    dashboard: LayoutDashboard,
    orders: FolderKanban,
    messages: MessageSquare,
    services: BriefcaseBusiness,
    profile: Sparkles,
    reviews: Star,
    earnings: Wallet,
    settings: Settings,
} as const

export type AppSidebarIconName = keyof typeof sidebarIcons

function isRouteActive(pathname: string, href: string) {
    if (pathname === href) {
        return true
    }

    return href !== "/dashboard/creator" && pathname.startsWith(`${href}/`)
}

export function AppSidebar({
    groups,
    workspaceName = "Creator Studio",
    workspaceSubtitle = "Character Market",
}: AppSidebarProps) {
    const pathname = usePathname()

    return (
        <Sidebar collapsible="icon" variant="inset" >
            <SidebarHeader >
                <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/60 group-data-[collapsible=icon]:border-none  p-2 group-data-[collapsible=icon]:p-0">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-sidebar-primary/12 text-sidebar-primary ring-1 ring-sidebar-primary/20 group-data-[collapsible=icon]:ring-0">
                            <Sparkles className="size-4" aria-hidden />
                        </span>
                        <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                            <p className="truncate text-sm font-semibold text-sidebar-foreground">
                                {workspaceName}
                            </p>
                            <p className="truncate text-xs text-sidebar-foreground/70">
                                {workspaceSubtitle}
                            </p>
                        </div>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                {groups?.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const Icon = sidebarIcons[item.icon]

                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton
                                                render={<Link href={item.href} />}
                                                isActive={isRouteActive(pathname, item.href)}
                                                tooltip={item.title}
                                            >
                                                <Icon />
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                            {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarSeparator />

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Notifications">
                            <Bell />
                            <span>Notifications</span>
                        </SidebarMenuButton>
                        <SidebarMenuBadge>3</SidebarMenuBadge>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton render={<Link href="/dashboard/creator/settings" />} tooltip="Settings">
                            <Settings />
                            <span>Settings</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Log out">
                            <LogOut />
                            <span>Log out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
