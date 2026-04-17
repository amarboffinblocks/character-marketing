"use client"

import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  FolderKanban,
  MessageCircleReply,
  TimerReset,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { CreatorOrder } from "@/features/creator/orders/types"
import type { OrderQuickFilter, OrderStatusFilter } from "@/features/creator/orders/utils"
import { getOrderSummaryMetrics } from "@/features/creator/orders/utils"

type OrdersSummaryCardsProps = {
  orders: CreatorOrder[]
  activeStatus: OrderStatusFilter
  activeQuickFilters: OrderQuickFilter[]
  onApplyStatus?: (status: OrderStatusFilter) => void
  onApplyQuickFilter?: (filter: OrderQuickFilter) => void
}

type CardDef = {
  title: string
  value: number
  note: string
  hint: string
  icon: typeof FolderKanban
  sparkline: number[]
  accent: string
  filterKind: "status" | "quick"
  filterValue: OrderStatusFilter | OrderQuickFilter
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) return null
  const width = 96
  const height = 28
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1

  const points = values
    .map((value, index) => {
      const x = (index * width) / Math.max(values.length - 1, 1)
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-7 w-24 text-primary"
      role="img"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function OrdersSummaryCards({
  orders,
  activeStatus,
  activeQuickFilters,
  onApplyStatus,
  onApplyQuickFilter,
}: OrdersSummaryCardsProps) {
  const metrics = getOrderSummaryMetrics(orders)

  const cards: CardDef[] = [
    {
      title: "Active Orders",
      value: metrics.activeOrders,
      note: "Commissions in your pipeline",
      hint: "Live queue",
      icon: FolderKanban,
      sparkline: [4, 5, 6, 5, 8, 9, metrics.activeOrders],
      accent: "text-sky-700 dark:text-sky-300",
      filterKind: "status",
      filterValue: "in_progress",
    },
    {
      title: "Due This Week",
      value: metrics.dueThisWeek,
      note: "Near-term delivery focus",
      hint: "Delivery priority",
      icon: CalendarClock,
      sparkline: [1, 2, 2, 3, 3, 4, metrics.dueThisWeek],
      accent: "text-amber-700 dark:text-amber-300",
      filterKind: "quick",
      filterValue: "due_soon",
    },
    {
      title: "Overdue",
      value: metrics.overdue,
      note: "Past delivery date",
      hint: "Needs immediate action",
      icon: TimerReset,
      sparkline: [0, 1, 1, 0, 1, 2, metrics.overdue],
      accent: "text-rose-700 dark:text-rose-300",
      filterKind: "quick",
      filterValue: "overdue",
    },
    {
      title: "Waiting on Buyer",
      value: metrics.waitingOnBuyer,
      note: "Pending buyer feedback",
      hint: "Follow-up needed",
      icon: MessageCircleReply,
      sparkline: [2, 1, 2, 3, 2, 4, metrics.waitingOnBuyer],
      accent: "text-orange-700 dark:text-orange-300",
      filterKind: "status",
      filterValue: "waiting_on_buyer",
    },
    {
      title: "Completed",
      value: metrics.completedThisMonth,
      note: "Closed orders this month",
      hint: "Monthly throughput",
      icon: CheckCircle2,
      sparkline: [1, 2, 3, 3, 5, 6, metrics.completedThisMonth],
      accent: "text-emerald-700 dark:text-emerald-300",
      filterKind: "status",
      filterValue: "completed",
    },
  ]

  function isCardActive(card: CardDef) {
    if (card.filterKind === "status") {
      return activeStatus === card.filterValue
    }
    return activeQuickFilters.includes(card.filterValue as OrderQuickFilter)
  }

  function handleCardClick(card: CardDef) {
    if (card.filterKind === "status") {
      onApplyStatus?.(card.filterValue as OrderStatusFilter)
    } else {
      onApplyQuickFilter?.(card.filterValue as OrderQuickFilter)
    }
  }

  return (
    <section aria-label="Orders summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon
        const active = isCardActive(card)
        return (
          <button
            key={card.title}
            type="button"
            onClick={() => handleCardClick(card)}
            className="text-left"
          >
            <Card
              size="sm"
              className={cn(
                "group relative overflow-hidden bg-linear-to-br from-primary/10 via-accent/30 to-background shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md",
                active && "ring-2 ring-primary/40"
              )}
            >
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
                <Sparkline values={card.sparkline} />
                <p className="text-xs leading-relaxed text-muted-foreground">{card.note}</p>
                <div className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-background/80 px-2 py-1">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${card.accent}`}>
                    <ArrowUpRight className="size-3" />
                    {card.hint}
                  </span>
                </div>
              </CardContent>
            </Card>
          </button>
        )
      })}
    </section>
  )
}
