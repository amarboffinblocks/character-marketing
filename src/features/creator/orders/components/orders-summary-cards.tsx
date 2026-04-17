import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  FolderKanban,
  MessageCircleReply,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CreatorOrder } from "@/features/creator/orders/types"
import { getOrderSummaryMetrics } from "@/features/creator/orders/utils"

type OrdersSummaryCardsProps = {
  orders: CreatorOrder[]
}

export function OrdersSummaryCards({ orders }: OrdersSummaryCardsProps) {
  const metrics = getOrderSummaryMetrics(orders)

  const cards = [
    {
      title: "Active Orders",
      value: String(metrics.activeOrders),
      note: "Commissions currently in your pipeline",
      hint: "Live queue health",
      icon: FolderKanban,
      accent: "text-sky-700 dark:text-sky-300",
    },
    {
      title: "Due This Week",
      value: String(metrics.dueThisWeek),
      note: "Orders requiring near-term delivery focus",
      hint: "Delivery priority",
      icon: CalendarClock,
      accent: "text-amber-700 dark:text-amber-300",
    },
    {
      title: "Waiting on Buyer",
      value: String(metrics.waitingOnBuyer),
      note: "Pending buyer feedback or approval",
      hint: "Follow-up needed",
      icon: MessageCircleReply,
      accent: "text-orange-700 dark:text-orange-300",
    },
    {
      title: "Completed This Month",
      value: String(metrics.completedThisMonth),
      note: "Successfully closed projects this month",
      hint: "Monthly throughput",
      icon: CheckCircle2,
      accent: "text-emerald-700 dark:text-emerald-300",
    },
  ] as const

  return (
    <section aria-label="Orders summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card
            key={card.title}
            size="sm"
            className="group relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/30 to-background shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="pointer-events-none absolute " />
            <CardHeader className="flex-row items-start justify-between pb-0">
              <div className="space-y-1">
                <CardDescription className="text-[11px] uppercase tracking-wide">
                  {card.title}
                </CardDescription>
                <CardTitle className="text-3xl leading-none font-semibold tracking-tight text-foreground">
                  {card.value}
                </CardTitle>
              </div>
              <span
                className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20"
                aria-hidden
              >
                <Icon className="size-4" />
              </span>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs leading-relaxed text-muted-foreground">{card.note}</p>
              <div className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-background/80 px-2 py-1">
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${card.accent}`}>
                  <ArrowUpRight className="size-3" />
                  {card.hint}
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
