import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type RecentActivityItem = {
  id: string
  buyerName: string
  packageName: string
  meta: string
  status: "new" | "in_progress" | "waiting_on_buyer" | "review" | "completed"
  href: string
}

const statusStyles: Record<RecentActivityItem["status"], string> = {
  new: "bg-primary/10 text-primary",
  in_progress: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  waiting_on_buyer: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  review: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
}

const statusLabels: Record<RecentActivityItem["status"], string> = {
  new: "New",
  in_progress: "In progress",
  waiting_on_buyer: "Waiting",
  review: "Review",
  completed: "Completed",
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

type RecentActivityCardProps = {
  activity: RecentActivityItem[]
}

export function RecentActivityCard({ activity }: RecentActivityCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex-row items-center justify-between border-b pb-4">
        <div>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>A live feed of your newest orders and updates.</CardDescription>
        </div>
        <Link
          href="/dashboard/creator/orders"
          className="text-xs font-medium text-primary hover:underline"
        >
          See all
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {activity.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/30"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  {initialsFromName(item.buyerName)}
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{item.buyerName}</p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                        statusStyles[item.status]
                      )}
                    >
                      {statusLabels[item.status]}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{item.packageName}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {item.id} · {item.meta}
                  </p>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

// Keep the legacy export type name compatible if other files imported it.
export type { RecentActivityItem as DashboardRecentActivityItem }
export const __recentActivityBadges = { statusStyles, statusLabels }
