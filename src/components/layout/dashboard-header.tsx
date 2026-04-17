"use client"
import Link from "next/link"
import { Bell, ChevronDown, ChevronsUpDown, LogOut, Settings, UserRound } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type DashboardHeaderUser = {
    name: string
    email: string
    avatarUrl?: string | null
    initials?: string
}

export type DashboardHeaderProps = {
    title?: string
    /** Optional secondary line under the title (e.g. short description). */
    subtitle?: string
    user?: DashboardHeaderUser
    /** Shown on the notification bell when there are unread items. */
    unreadCount?: number
    className?: string
}

function initialsFromName(name: string) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
        return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase() || "?"
}

const demoNotifications = [
    {
        id: "1",
        title: "New order received",
        body: "A buyer placed an order for “Character pack — neon city”.",
        time: "2m ago",
    },
    {
        id: "2",
        title: "Payout sent",
        body: "Your last payout was processed successfully.",
        time: "1h ago",
    },
    {
        id: "3",
        title: "Review reminder",
        body: "You have 2 orders waiting for delivery.",
        time: "Yesterday",
    },
] as const

export function DashboardHeader({
    title,
    subtitle,
    user = {
        name: "Creator",
        email: "you@example.com",
    },
    unreadCount = 3,
    className,
}: DashboardHeaderProps) {
    const displayInitials = user.initials ?? initialsFromName(user.name)

    return (
        <header
            className={cn(
                "sticky top-0 z-40 w-full border-b px-4 py-2 backdrop-blur ",
                className
            )}
        >
            <div className="flex  flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                    {title ? (
                        <div className="">
                            <h1 className="truncate capitalize text-lg font-semibold tracking-tight text-foreground md:text-xl">
                                {title}
                            </h1>
                            {subtitle ? (
                                <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
                            ) : null}
                        </div>
                    ) : (
                        <span className="sr-only">Dashboard</span>
                    )}
                </div>

                <div className="flex shrink-0 items-center  gap-2">
                    <DropdownMenu>
                        <div className="relative">
                            <DropdownMenuTrigger
                                render={
                                    <button
                                        type="button"
                                        className={cn(
                                            buttonVariants({ variant: "ghost", size: "icon" })
                                        )}
                                        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
                                    />
                                }
                            >
                                <Bell className="size-4" aria-hidden />
                            </DropdownMenuTrigger>
                            {unreadCount > 0 ? (
                                <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground ring-2 ring-background tabular-nums">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            ) : null}
                        </div>
                        <DropdownMenuContent
                            align="end"
                            className="w-[min(100vw-2rem,20rem)] rounded-xl p-0"
                            sideOffset={6}
                        >
                            <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
                                <span className="text-sm font-semibold text-foreground">
                                    Notifications
                                </span>
                                {unreadCount > 0 ? (
                                    <Badge variant="secondary" className="font-normal">
                                        {unreadCount} new
                                    </Badge>
                                ) : null}
                            </div>
                            <DropdownMenuGroup className="max-h-72 overflow-y-auto py-1">
                                {demoNotifications.map((item) => (
                                    <DropdownMenuItem
                                        key={item.id}
                                        className="cursor-pointer flex-col items-start gap-0 rounded-none px-3 py-2.5 whitespace-normal"
                                    >
                                        <span className="font-medium text-foreground">{item.title}</span>
                                        <span className="text-xs leading-snug text-muted-foreground line-clamp-2">
                                            {item.body}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground/80">
                                            {item.time}
                                        </span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator className="m-0" />
                            <div className="p-1">
                                <DropdownMenuItem
                                    render={<Link href="/dashboard/creator" className="cursor-pointer justify-center text-center font-medium" />}
                                >
                                    View all activity
                                </DropdownMenuItem>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className={"cursor-pointer"}
                        >
                            <div
                                className="w-full flex justify-between items-center gap-4 rounded-xl px-2 py-2 bg-muted/60"
                            >
                                {/* LEFT: Avatar + Info */}
                                <div className="flex  items-center gap-2">
                                    <Avatar className=" ring-1 ring-border">
                                        {user.avatarUrl && (
                                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                                        )}
                                        <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                                            {user.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex flex-col text-left leading-tight">
                                        {/* Name */}
                                        <span className="truncate text-sm  text-foreground ">
                                            Amarjeet
                                        </span>

                                        {/* Role (instead of email like your screenshot) */}
                                        <span className=" truncate -mt-1 text-xs text-muted-foreground">
                                            creator
                                        </span>
                                    </div>
                                </div>

                                {/* RIGHT: Icon */}
                                <ChevronsUpDown className="size-4 text-muted-foreground opacity-80" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-56 rounded-xl"
                            sideOffset={6}
                        >
                            <DropdownMenuLabel className="font-normal">
                                <p className="truncate text-sm font-medium text-foreground">
                                    {user.name}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    render={<Link href="/dashboard/creator" className="cursor-pointer" />}
                                >
                                    <UserRound className="size-4" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    render={<Link href="/dashboard/creator/orders" className="cursor-pointer" />}
                                >
                                    <Settings className="size-4" />
                                    Settings
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="destructive"
                                render={<Link href="/sign-in" className="cursor-pointer" />}
                            >
                                <LogOut className="size-4" />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
