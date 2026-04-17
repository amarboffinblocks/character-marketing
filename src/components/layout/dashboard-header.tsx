"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, LogOut, Search, Settings, UserRound } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export type DashboardHeaderUser = {
    name: string
    email: string
    role?: string
    avatarUrl?: string | null
    initials?: string
}

export type DashboardHeaderProps = {
  /** Override the title derived from the current pathname. */
  title?: string
  /** Root segment used to derive a clean page title from pathname. */
  basePath?: string
  user?: DashboardHeaderUser
  /** Hide the contextual search field (useful on narrow layouts). */
  showSearch?: boolean
  className?: string
}

const defaultUser: DashboardHeaderUser = {
  name: "Creator",
  email: "you@example.com",
  role: "Creator",
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`.toUpperCase()
  }
  return (parts[0]?.slice(0, 2) ?? "").toUpperCase() || "?"
}

function humanizeSegment(segment: string) {
  return segment.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function deriveTitleFromPath(pathname: string, basePath: string) {
  const normalizedBase = basePath.replace(/\/+$/, "")
  const baseSegments = normalizedBase.split("/").filter(Boolean)
  const allSegments = pathname.split("/").filter(Boolean)
  const trailing = allSegments.slice(baseSegments.length)

  if (trailing.length === 0) return "Dashboard"
  return humanizeSegment(trailing[trailing.length - 1] ?? "Dashboard")
}

export function DashboardHeader({
  title,
  basePath = "/dashboard/creator",
  user = defaultUser,
  showSearch = true,
  className,
}: DashboardHeaderProps) {
  const pathname = usePathname() ?? basePath
  const displayInitials = user.initials ?? initialsFromName(user.name)
  const hasCustomTitle = Boolean(title)
  const hasNestedRoute = pathname !== basePath
  const shouldShowHeading = hasCustomTitle || hasNestedRoute
  const headingTitle = title ?? deriveTitleFromPath(pathname, basePath)
  const roleLabel = user.role ?? defaultUser.role ?? "Creator"

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60",
        className
      )}
    >
      <div className="flex h-14 items-center justify-between gap-2 px-3 sm:px-4">
        <SidebarTrigger className="-ml-1" />

        {shouldShowHeading ? (
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">
              {headingTitle}
            </h1>
            <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {showSearch ? (
          <div className="relative hidden w-full max-w-xs lg:block">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search orders, services..."
              aria-label="Search"
              className="h-9 pl-8 text-sm"
            />
          </div>
        ) : null}

        <div className="flex shrink-0 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Notifications">
                  <Bell />
                </Button>
              }
            />
            <DropdownMenuContent>
              <DropdownMenuItem
                render={<Link href={`${basePath}/orders/all`} className="cursor-pointer" />}
              >
                <Bell className="size-4" />
                View updates
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Avatar className="size-7 ring-1 ring-border">
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {displayInitials}
                  </AvatarFallback>
                </Avatar>
              }
            />
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem render={<Link href={basePath} className="cursor-pointer" />}>
                  <UserRound className="size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href={`${basePath}/orders/all`} className="cursor-pointer" />}
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
