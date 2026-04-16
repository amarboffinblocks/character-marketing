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
    SidebarTrigger,
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
        <Sidebar collapsible="icon" variant="inset" className="bg-accent" >
            <SidebarHeader className="bg-accent" >
                <div className="flex gap-2 group-data-[collapsible=icon]:flex-col justify-between items-center">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-sidebar-primary/12 text-sidebar-primary ring-1 ring-sidebar-primary/20 group-data-[collapsible=icon]:ring-0  ">
                        <Sparkles className="size-4" aria-hidden />
                    </span>
                    <SidebarTrigger className="group-data-[collapsible=icon]:order-1 " />

                </div>

            </SidebarHeader>

            <SidebarContent className="bg-accent">
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
                                                className="hover:bg-sidebar-accent/50"
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

            <SidebarFooter className="bg-accent">
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
        </Sidebar>
    )
}
