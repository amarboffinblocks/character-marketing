import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { CreatorDashboardStat } from "@/features/creator/dashboard/types"

type DashboardStatsGridProps = {
  stats: CreatorDashboardStat[]
}

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <section aria-label="Key metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} size="sm" className="ring-border/70">
            <CardHeader className="flex-row items-center justify-between pb-0">
              <CardDescription className="text-xs">{stat.label}</CardDescription>
              <span
                className="inline-flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary"
                aria-hidden
              >
                <Icon className="size-3.5" />
              </span>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </span>
              <span
                className={cn(
                  "text-xs",
                  stat.trend === "up"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : stat.trend === "down"
                      ? "text-destructive"
                      : "text-muted-foreground"
                )}
              >
                {stat.delta}
              </span>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
