import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type DeadlineDay = {
  date: string
  weekday: string
  count: number
  tone: "none" | "ok" | "warning" | "overdue"
}

type DeadlinesStripProps = {
  days: DeadlineDay[]
}

const toneClass: Record<DeadlineDay["tone"], string> = {
  none: "bg-muted text-muted-foreground",
  ok: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  overdue: "bg-destructive/15 text-destructive",
}

export function DeadlinesStrip({ days }: DeadlinesStripProps) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Upcoming deadlines</CardTitle>
        <CardDescription>Next 7 days snapshot from your active orders.</CardDescription>
      </CardHeader>
      <CardContent className="py-4">
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => (
            <div
              key={day.date}
              className="flex flex-col items-center justify-between gap-1 rounded-lg border border-border/70 p-2 text-center"
            >
              <span className="text-[11px] font-medium text-muted-foreground">{day.weekday}</span>
              <span className="text-sm font-semibold text-foreground">{day.date}</span>
              <span
                className={cn(
                  "mt-1 inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                  toneClass[day.tone]
                )}
              >
                {day.count === 0 ? "—" : `${day.count} due`}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
