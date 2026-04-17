"use client"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { creatorOrders } from "@/features/creator/orders/data"
import { isOrderOverdue } from "@/features/creator/orders/utils"

export type SavedView =
  | "all"
  | "needs_response"
  | "due_soon"
  | "in_progress"
  | "waiting"
  | "completed"
  | "overdue"

type OrdersViewTabsProps = {
  value: SavedView
  onChange: (value: SavedView) => void
}

function countOrders(predicate: (order: (typeof creatorOrders)[number]) => boolean) {
  return creatorOrders.filter(predicate).length
}

function getTabCounts() {
  return {
    all: creatorOrders.length,
    needs_response: countOrders((order) => Boolean(order.needsResponse)),
    due_soon: countOrders((order) => {
      const due = new Date(order.dueDateTime).getTime()
      const days = (due - Date.now()) / (1000 * 60 * 60 * 24)
      return days >= 0 && days <= 7
    }),
    in_progress: countOrders((order) => order.status === "in_progress"),
    waiting: countOrders((order) => order.status === "waiting_on_buyer"),
    completed: countOrders((order) => order.status === "completed"),
    overdue: countOrders((order) => isOrderOverdue(order)),
  }
}

export function OrdersViewTabs({ value, onChange }: OrdersViewTabsProps) {
  const counts = getTabCounts()

  const tabs: { value: SavedView; label: string; count: number }[] = [
    { value: "all", label: "All", count: counts.all },
    { value: "needs_response", label: "Needs response", count: counts.needs_response },
    { value: "due_soon", label: "Due soon", count: counts.due_soon },
    { value: "overdue", label: "Overdue", count: counts.overdue },
    { value: "in_progress", label: "In progress", count: counts.in_progress },
    { value: "waiting", label: "Waiting on buyer", count: counts.waiting },
    { value: "completed", label: "Completed", count: counts.completed },
  ]

  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as SavedView)}>
      <TabsList className="flex h-auto w-full flex-wrap gap-1 rounded-xl bg-muted/40 p-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="h-8 gap-2 rounded-lg px-3 text-sm"
          >
            <span>{tab.label}</span>
            <Badge
              variant="secondary"
              className="h-5 min-w-5 justify-center bg-background px-1.5 text-[10px] font-medium data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
            >
              {tab.count}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
