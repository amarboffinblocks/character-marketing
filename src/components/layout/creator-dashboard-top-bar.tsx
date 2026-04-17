"use client"

import type { ReactNode } from "react"
import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  ChevronDown,
  CreditCard,
  Gift,
  LogOut,
  PlusCircle,
  Search,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const SEARCH_INPUT_ID = "creator-dashboard-search"

const creatorProfile = {
  name: "Avery Chen",
  role: "Creator",
  email: "avery@character.market",
  initials: "AC",
} as const

const notifications = [
  {
    id: "1",
    title: "New order from Nova Studio",
    detail: "Anime VTuber model sheet · $680",
    time: "12 min ago",
    unread: true,
  },
  {
    id: "2",
    title: "Buyer replied in PixelRaid",
    detail: "Revision notes added to your delivery thread",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: "3",
    title: "Payout scheduled",
    detail: "$1,240 releasing after order completion",
    time: "Yesterday",
    unread: false,
  },
] as const

const unreadCount = notifications.filter((n) => n.unread).length

function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded border border-border/80 bg-muted/60 px-1 font-mono text-[10px] font-medium text-muted-foreground shadow-sm",
        className
      )}
    >
      {children}
    </kbd>
  )
}

export function CreatorDashboardTopBar() {
  const router = useRouter()
  const searchRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        const el = searchRef.current ?? document.getElementById(SEARCH_INPUT_ID)
        if (el instanceof HTMLInputElement) {
          el.focus()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-border/60 bg-background">
      <div className="flex h-auto min-h-14 flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 md:h-[60px] md:flex-nowrap md:gap-4 md:py-0 md:px-6">
        <SidebarTrigger className="-ml-1 shrink-0 text-muted-foreground hover:text-foreground" />
        <div className="min-w-0 flex-1 md:hidden" aria-hidden />

        <div className="relative order-3 w-full min-w-0 md:order-0 md:max-w-2xl md:flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            ref={searchRef}
            id={SEARCH_INPUT_ID}
            type="search"
            placeholder="Search"
            className="h-10 rounded-full border-border/80 bg-muted/40 pl-10 pr-24 shadow-none placeholder:text-muted-foreground/80 focus-visible:bg-background md:pr-28"
            aria-label="Search dashboard"
          />
          <div
            className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-1 sm:flex"
            aria-hidden
          >
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1 md:order-0 order-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="hidden text-muted-foreground hover:text-foreground sm:inline-flex"
            aria-label="Rewards and referrals"
            onClick={() => router.push("/dashboard/creator/earnings")}
          >
            <Gift className="size-[18px]" strokeWidth={1.75} aria-hidden />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-sm" }),
                "relative text-muted-foreground hover:text-foreground"
              )}
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            >
              <Bell className="size-[18px]" strokeWidth={1.75} aria-hidden />
              {unreadCount > 0 ? (
                <span className="absolute right-1 top-1 flex size-2 rounded-full bg-primary ring-2 ring-background" />
              ) : null}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(100vw-2rem,22rem)] p-0" sideOffset={8}>
              <div className="flex items-center justify-between border-b px-3 py-2.5">
                <DropdownMenuLabel className="p-0 text-sm font-semibold text-foreground">
                  Notifications
                </DropdownMenuLabel>
                {unreadCount > 0 ? (
                  <Badge variant="secondary" className="text-[10px] font-medium">
                    {unreadCount} new
                  </Badge>
                ) : null}
              </div>
              <div className="max-h-72 overflow-y-auto p-1">
                {notifications.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    className="flex cursor-pointer flex-col items-start gap-0.5 rounded-md px-2 py-2.5"
                    onClick={() => router.push("/dashboard/creator/orders")}
                  >
                    <span className="flex w-full items-start justify-between gap-2 text-left">
                      <span className="text-sm font-medium leading-snug">{item.title}</span>
                      {item.unread ? (
                        <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                      ) : null}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.detail}</span>
                    <span className="text-xs text-muted-foreground/80">{item.time}</span>
                  </DropdownMenuItem>
                ))}
              </div>
              <Separator />
              <div className="p-1">
                <DropdownMenuItem
                  className="justify-center text-sm font-medium text-primary"
                  onClick={() => router.push("/dashboard/creator/orders")}
                >
                  View all activity
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-sm" }),
                "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Create new"
            >
              <PlusCircle className="size-[18px]" strokeWidth={1.75} aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52" sideOffset={8}>
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Quick create</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push("/dashboard/creator/services")}>
                <Sparkles className="size-4" aria-hidden />
                New service
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/creator/requests")}>
                View requests
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/creator/orders")}>
                View orders
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="mx-1.5 h-7 hidden sm:block" />

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex items-center bg-muted gap-2.5 rounded-lg px-2 py-1.5 text-left outline-none transition-colors",
                "hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring"
              )}
              aria-label="Open profile menu"
              
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary ring-1 ring-primary/15">
                {creatorProfile.initials}
              </span>
              <span className="hidden min-w-0 flex-col sm:flex">
                <span className="truncate text-sm font-semibold leading-tight text-foreground">
                  {creatorProfile.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">{creatorProfile.role}</span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{creatorProfile.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{creatorProfile.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push("/dashboard/creator/profile")}>
                  <UserRound className="size-4" aria-hidden />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/creator/services")}>
                  <Sparkles className="size-4" aria-hidden />
                  Services
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/creator/earnings")}>
                  <CreditCard className="size-4" aria-hidden />
                  Earnings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/creator/settings")}>
                  <Settings className="size-4" aria-hidden />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => router.push("/sign-in")}>
                <LogOut className="size-4" aria-hidden />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
