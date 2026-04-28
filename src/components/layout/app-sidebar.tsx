"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import {
    AlertCircle,
    BarChart3,
    BriefcaseBusiness,
    ChevronsUpDown,
    FolderKanban,
    LayoutDashboard,
    LifeBuoy,
    LogOut,
    MessageSquare,
    Settings,
    Sparkles,
    Star,
    Store,
    UserRound,
    Users,
    Wallet,
} from "lucide-react"

import Logo from "@/components/icons/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
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
    /** Home link for the logo / title (e.g. creator vs admin dashboard). */
    brandHref?: string
    /** Route used for the "help & support" link in the footer. */
    supportHref?: string
    /** Show warning badge when profile completion is low. */
    showProfileWarning?: boolean
    userDisplayName?: string
    userEmail?: string
    userAvatarUrl?: string | null
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
    users: Users,
    store: Store,
    chart: BarChart3,
} as const

export type AppSidebarIconName = keyof typeof sidebarIcons

function ProfileWarningBadge() {
    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <span className="inline-flex size-4 items-center justify-center rounded-full border border-yellow-200 bg-yellow-400 text-white shadow-sm">
                        <AlertCircle className="size-4" aria-hidden />
                    </span>
                }
            />
            <TooltipContent className="border border-border bg-card text-card-foreground shadow-lg">
                <span className="inline-flex items-center gap-1.5">
                    <AlertCircle className="size-4 text-yellow-500" aria-hidden />
                    Profile is incomplete
                </span>
            </TooltipContent>
        </Tooltip>
    )
}

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

function getGlobalActiveHref(pathname: string, groups?: AppSidebarGroup[]) {
  const allItems = groups?.flatMap((group) => group.items) ?? []
  return getActiveHref(pathname, allItems)
}

export function AppSidebar({
    groups,
    workspaceName = "Character Market",
    workspaceSubtitle = "Creator Studio",
    brandHref = "/dashboard/creator",
    supportHref = "/support",
    showProfileWarning = false,
    userDisplayName = "Character Market User",
    userEmail = "user@example.com",
    userAvatarUrl = null,
}: AppSidebarProps) {
    const pathname = usePathname() ?? ""
    const router = useRouter()
    const [isSigningOut, setIsSigningOut] = useState(false)
    const visibleGroups = groups?.filter((group) => group.label.toLowerCase() !== "account")
  const globalActiveHref = getGlobalActiveHref(pathname, visibleGroups)
    const accountBasePath = brandHref.startsWith("/dashboard/admin") ? "/dashboard/admin" : "/dashboard/creator"

    const handleSignOut = async () => {
        if (isSigningOut) return
        setIsSigningOut(true)
        try {
            const response = await fetch("/api/auth/sign-out", { method: "POST" })
            if (!response.ok) {
                toast.error("Logout failed", { description: "Please try again." })
                return
            }
            toast.success("Logged out successfully")
            router.push("/sign-in")
            router.refresh()
        } catch {
            toast.error("Logout failed", { description: "Please try again." })
        } finally {
            setIsSigningOut(false)
        }
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="px-2 pt-3 pb-2 ">
                <div className="flex  group-data-[collapsible=icon]:flex-col justify-between items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <button
                                    type="button"
                                    className="group/brand flex w-full items-center gap-2 rounded-md p-1 text-left outline-none transition-colors hover:bg-sidebar-accent/60 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                                >
                                    <span
                                        className="inline-flex h-8 w-auto shrink-0 items-center overflow-hidden rounded-lg"
                                        aria-hidden
                                    >
                                        <Logo className="h-8 w-auto" />
                                    </span>
                                    <div className="flex min-w-0 flex-1 flex-col leading-tight group-data-[collapsible=icon]:hidden">
                                        <span className="truncate text-sm font-semibold text-sidebar-foreground">
                                            {workspaceName}
                                        </span>
                                        <span className="truncate text-[11px] text-sidebar-foreground/60">
                                            {workspaceSubtitle}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="size-4 text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden" />
                                </button>
                            }
                        />
                        <DropdownMenuContent align="start" className="min-w-52">
                            <DropdownMenuItem render={<Link href={brandHref} className="cursor-pointer" />}>
                                Creator Studio
                            </DropdownMenuItem>
                            <DropdownMenuItem render={<Link href="/" className="cursor-pointer" />}>
                                Buyer Workspace
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <SidebarTrigger />
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {visibleGroups?.map((group) => {
                                const activeHref = globalActiveHref
                                const isWorkspaceGroup = group.label.toLowerCase() === "workspace"

                                if (!isWorkspaceGroup) {
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
                                }

                                return (
                                    <SidebarMenuItem key={group.label}>
                                        <details open={Boolean(activeHref)} className="group/workspace">
                                            <summary className="list-none">
                                                <div className="flex h-8 w-full cursor-pointer items-center justify-between rounded-md px-2 text-sm text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                                    <span className="flex items-center gap-2 font-medium">
                                                        <BriefcaseBusiness className="size-4" />
                                                        {group.label}
                                                    </span>
                                                    <ChevronsUpDown className="size-4 text-sidebar-foreground/70" />
                                                </div>
                                            </summary>
                                            <div className="mt-1 ml-4 border-l border-sidebar-border/70 pl-2">
                                                <SidebarMenu>
                                                    {group.items.map((item) => {
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
                                                    })}
                                                </SidebarMenu>
                                            </div>
                                        </details>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="px-2 pb-3">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <button
                                type="button"
                                className="flex w-full items-center gap-2 rounded-md border border-sidebar-border/70 bg-sidebar-accent/40 p-2 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                            >
                                <span className="relative inline-flex">
                                    <Avatar className="size-8">
                                        <AvatarImage src={userAvatarUrl ?? undefined} />
                                        <AvatarFallback>
                                            {userDisplayName
                                                .trim()
                                                .split(/\s+/)
                                                .map((part) => part.slice(0, 1))
                                                .join("")
                                                .slice(0, 2)
                                                .toUpperCase() || "CM"}
                                        </AvatarFallback>
                                    </Avatar>
                                    {showProfileWarning ? (
                                        <span className="absolute -right-1 -top-1">
                                            <ProfileWarningBadge />
                                        </span>
                                    ) : null}
                                </span>
                                <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                                    <p className="truncate text-sm font-medium text-sidebar-foreground">{userDisplayName}</p>
                                    <p className="truncate text-xs text-sidebar-foreground/70">{userEmail}</p>
                                </div>
                                <ChevronsUpDown className="size-4 text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden" />
                            </button>
                        }
                    />
                    <DropdownMenuContent align="start" className="min-w-56">
                        <DropdownMenuItem
                            className="flex items-center justify-between"
                            render={<Link href={`${accountBasePath}/profile`} className="cursor-pointer" />}
                        >
                            <span className="flex items-center gap-2">
                                <UserRound className="size-4" />
                                Profile
                            </span>
                            {showProfileWarning ? (
                                <span>
                                    <ProfileWarningBadge />
                                </span>
                            ) : null}
                        </DropdownMenuItem>
                        <DropdownMenuItem render={<Link href={`${accountBasePath}/settings`} className="cursor-pointer" />}>
                            <Settings className="size-4" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem render={<Link href={supportHref} className="cursor-pointer" />}>
                            <LifeBuoy className="size-4" />
                            Help
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                        >
                            <LogOut className="size-4" />
                            {isSigningOut ? "Logging out..." : "Logout"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
