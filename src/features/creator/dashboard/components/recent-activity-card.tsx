import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { CreatorDashboardActivity } from "@/features/creator/dashboard/types"

const statusStyles: Record<CreatorDashboardActivity["status"], string> = {
  new: "bg-primary/10 text-primary",
  in_progress: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
}

const statusLabels: Record<CreatorDashboardActivity["status"], string> = {
  new: "New",
  in_progress: "In progress",
  completed: "Completed",
}

type RecentActivityCardProps = {
  activity: CreatorDashboardActivity[]
}

export function RecentActivityCard({ activity }: RecentActivityCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex-row items-center justify-between border-b pb-4">
        <div>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            A live feed of your newest orders and updates.
          </CardDescription>
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
            <li key={item.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-sm font-medium text-foreground">
                  {item.title}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {item.id} · {item.meta}
                </span>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                  statusStyles[item.status]
                )}
              >
                {statusLabels[item.status]}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
