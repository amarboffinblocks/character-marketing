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
          <Card
            key={stat.label}
            size="sm"
            className="ring-border/70 bg-linear-to-br from-primary/8 via-primary/5 to-card"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <CardDescription className="text-xs">{stat.label}</CardDescription>
                  <span className="text-3xl font-semibold tracking-tight text-foreground">
                    {stat.value}
                  </span>
                </div>
                <span
                  className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20"
                  aria-hidden
                >
                  <Icon className="size-6" />
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <span
                className={cn(
                  "text-sm",
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
