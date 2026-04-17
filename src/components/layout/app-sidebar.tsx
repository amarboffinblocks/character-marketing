"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    BriefcaseBusiness,
    FolderKanban,
    LayoutDashboard,
    LifeBuoy,
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
    /** Route used for the "help & support" link in the footer. */
    supportHref?: string
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
    if (pathname === href) return true
    // Avoid treating every dashboard sub-page as matching the index route.
    if (href === "/" || pathname === "/") return false
    const normalized = href.replace(/\/+$/, "")
    return pathname.startsWith(`${normalized}/`)
}

function getActiveHref(pathname: string, items: AppSidebarItem[]) {
    const matched = items
        .map((item) => item.href)
        .filter((href) => isRouteActive(pathname, href))
        .sort((a, b) => b.length - a.length)

    return matched[0]
}

export function AppSidebar({
    groups,
    workspaceName = "Character Market",
    workspaceSubtitle = "Creator Studio",
    supportHref = "/support",
}: AppSidebarProps) {
    const pathname = usePathname() ?? ""

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="px-2 pt-3 pb-2">
                <Link
                    href="/dashboard/creator"
                    className="group/brand flex items-center gap-2 rounded-md p-1 outline-none transition-colors hover:bg-sidebar-accent/60 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                >
                    <span
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm ring-1 ring-sidebar-primary/30"
                        aria-hidden
                    >
                        <Sparkles className="size-4" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate text-sm font-semibold text-sidebar-foreground">
                            {workspaceName}
                        </span>
                        <span className="truncate text-[11px] text-sidebar-foreground/60">
                            {workspaceSubtitle}
                        </span>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                {groups?.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {(() => {
                                    const activeHref = getActiveHref(pathname, group.items)

                                    return group.items.map((item) => {
                                        const Icon = sidebarIcons[item.icon]
                                        const active = item.href === activeHref

                                        return (
                                            <SidebarMenuItem key={item.href}>
                                                <SidebarMenuButton
                                                    render={<Link href={item.href} />}
                                                    isActive={active}
                                                    tooltip={item.title}
                                                    className="data-active:bg-sidebar-primary/10 data-active:text-sidebar-primary data-active:hover:bg-sidebar-primary/15 data-active:hover:text-sidebar-primary data-active:[&_svg]:text-sidebar-primary"
                                                >
                                                    <Icon />
                                                    <span>{item.title}</span>
                                                </SidebarMenuButton>
                                                {item.badge ? (
                                                    <SidebarMenuBadge
                                                        className={
                                                            active
                                                                ? "bg-sidebar-primary/10 text-sidebar-primary"
                                                                : "bg-sidebar-accent text-sidebar-accent-foreground"
                                                        }
                                                    >
                                                        {item.badge}
                                                    </SidebarMenuBadge>
                                                ) : null}
                                            </SidebarMenuItem>
                                        )
                                    })
                                })()}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="px-2 pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            render={<Link href={supportHref} />}
                            tooltip="Help & support"
                            size="sm"
                            className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
                        >
                            <LifeBuoy />
                            <span>Help &amp; support</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
