"use client"

import Image from "next/image"
import Link from "next/link"
import { Bell } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { headerNotifications } from "@/components/layout/header-notifications-data"
import { cn } from "@/lib/utils"

export function HeaderNotifications() {
  const count = headerNotifications.length

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
            aria-label={count > 0 ? `Notifications, ${count} new` : "Notifications"}
          >
            <Bell className="size-4" aria-hidden />
            {count > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 flex min-w-4 justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
                {count > 9 ? "9+" : count}
              </span>
            ) : null}
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-[min(calc(100vw-2rem),380px)] p-0">
        <div className="border-b border-border/60 px-3 py-2">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Messages from creators you follow or order from
          </p>
        </div>
        <div className="max-h-72 overflow-y-auto py-1">
          {headerNotifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="h-auto cursor-pointer items-start gap-3 rounded-none px-3 py-2.5 data-[highlighted]:bg-accent"
              render={
                <Link
                  href={`/creators/${n.creatorId}`}
                  className="flex w-full min-w-0 gap-3 outline-none"
                />
              }
            >
              <span className="relative mt-0.5 size-10 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
                <Image
                  src={n.creatorAvatar}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-medium text-foreground">{n.creatorName}</span>
                <span className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
                  {n.message}
                </span>
                <span className="mt-1 block text-[10px] text-muted-foreground">{n.timeLabel}</span>
              </span>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuItem
          className="cursor-pointer justify-center py-2 text-xs font-medium text-primary"
          render={<Link href="/creators" className="w-full text-center" />}
        >
          View all creators
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
