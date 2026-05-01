"use client"

import Link from "next/link"
import { Bell, MessageSquare, Sparkles } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useInboxFeed } from "@/features/inbox/use-inbox-feed"
import { cn } from "@/lib/utils"

type HeaderNotificationsProps = {
  userRole: "creator" | "buyer"
}

export function HeaderNotifications({ userRole }: HeaderNotificationsProps) {
  const { unreadCount, unreadPreview, markItemRead } = useInboxFeed(userRole)
  const inboxHref = userRole === "creator" ? "/dashboard/creator/inbox" : "/inbox"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "relative size-9 shrink-0 rounded-full"
            )}
            aria-label={unreadCount > 0 ? `Inbox, ${unreadCount} unread` : "Inbox"}
          >
            <Bell className="size-4" aria-hidden />
            {unreadCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 flex min-w-4 justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-[min(calc(100vw-2rem),380px)] p-0">
        <div className="border-b border-border/60 px-3 py-2">
          <p className="text-sm font-semibold text-foreground">Inbox</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Unified chat and activity updates
          </p>
        </div>
        <div className="max-h-72 overflow-y-auto py-1">
          {unreadPreview.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">No unread updates.</div>
          ) : (
            unreadPreview.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={() => markItemRead(item.id)}
                className="h-auto cursor-pointer items-start gap-3 rounded-none px-3 py-2.5 data-highlighted:bg-accent"
                render={<Link href={item.actionUrl} className="flex w-full min-w-0 gap-3 outline-none" />}
              >
                <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted ring-1 ring-border/60">
                  {item.type === "chat" ? <MessageSquare className="size-4 text-sky-600" /> : <Sparkles className="size-4 text-primary" />}
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-sm font-medium text-foreground">{item.title}</span>
                  <span className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
                    {item.body}
                  </span>
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuItem
          className="cursor-pointer justify-center py-2 text-xs font-medium text-primary"
          render={<Link href={inboxHref} className="w-full text-center" />}
        >
          Open inbox
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
