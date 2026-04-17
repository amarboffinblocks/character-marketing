import type {
  CreatorOrderPriority,
  CreatorOrder,
  CreatorOrderStatus,
} from "@/features/creator/orders/types"

export const orderStatusLabelMap: Record<CreatorOrderStatus, string> = {
  new: "New",
  in_progress: "In progress",
  waiting_on_buyer: "Waiting on buyer",
  review: "Review",
  completed: "Completed",
}

export const orderStatusClassMap: Record<CreatorOrderStatus, string> = {
  new: "bg-primary/10 text-primary",
  in_progress: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  waiting_on_buyer: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  review: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
}

export type OrderSortValue =
  | "due-asc"
  | "due-desc"
  | "amount-desc"
  | "updated-desc"

export type OrderQuickFilter = "due_soon" | "high_value" | "needs_response"

export type OrderStatusFilter = CreatorOrderStatus | "all"

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function filterOrdersByScope(
  orders: CreatorOrder[],
  scope: "all" | "active" | "completed"
) {
  switch (scope) {
    case "all":
      return orders
    case "active":
      return orders.filter((order) => order.status !== "completed")
    case "completed":
      return orders.filter((order) => order.status === "completed")
  }
}

export function getOrderPriorityClass(priority: CreatorOrderPriority) {
  switch (priority) {
    case "low":
      return "text-muted-foreground"
    case "medium":
      return "text-amber-700 dark:text-amber-300"
    case "high":
      return "text-rose-700 dark:text-rose-300"
  }
}

function isDueSoon(order: CreatorOrder) {
  const due = new Date(order.dueDateTime).getTime()
  const now = Date.now()
  const days = (due - now) / (1000 * 60 * 60 * 24)
  return days >= 0 && days <= 7
}

export function applyOrderFilters(
  orders: CreatorOrder[],
  options: {
    search: string
    status: OrderStatusFilter
    quickFilters: OrderQuickFilter[]
  }
) {
  const query = options.search.trim().toLowerCase()

  return orders.filter((order) => {
    const matchesSearch =
      query.length === 0 ||
      order.id.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.packageName.toLowerCase().includes(query)

    const matchesStatus =
      options.status === "all" ? true : order.status === options.status

    const matchesQuickFilters = options.quickFilters.every((filter) => {
      switch (filter) {
        case "due_soon":
          return isDueSoon(order)
        case "high_value":
          return order.amount >= 2000
        case "needs_response":
          return Boolean(order.needsResponse)
      }
    })

    return matchesSearch && matchesStatus && matchesQuickFilters
  })
}

export function sortOrders(orders: CreatorOrder[], sortValue: OrderSortValue) {
  const sorted = [...orders]
  sorted.sort((a, b) => {
    switch (sortValue) {
      case "due-asc":
        return (
          new Date(a.dueDateTime).getTime() - new Date(b.dueDateTime).getTime()
        )
      case "due-desc":
        return (
          new Date(b.dueDateTime).getTime() - new Date(a.dueDateTime).getTime()
        )
      case "amount-desc":
        return b.amount - a.amount
      case "updated-desc":
        return (
          new Date(b.updatedAtTime).getTime() -
          new Date(a.updatedAtTime).getTime()
        )
    }
  })
  return sorted
}

export function getOrderSummaryMetrics(orders: CreatorOrder[]) {
  const activeOrders = orders.filter((order) => order.status !== "completed").length
  const dueThisWeek = orders.filter((order) => isDueSoon(order)).length
  const waitingOnBuyer = orders.filter(
    (order) => order.status === "waiting_on_buyer"
  ).length
  const completedThisMonth = orders.filter(
    (order) => order.status === "completed"
  ).length

  return { activeOrders, dueThisWeek, waitingOnBuyer, completedThisMonth }
}

export function getDueDateTone(order: CreatorOrder) {
  const due = new Date(order.dueDateTime).getTime()
  const now = Date.now()
  const days = (due - now) / (1000 * 60 * 60 * 24)

  if (days <= 2) {
    return "text-rose-700 dark:text-rose-300"
  }
  if (days <= 7) {
    return "text-amber-700 dark:text-amber-300"
  }
  return "text-muted-foreground"
}

export function getDeadlineState(order: CreatorOrder) {
  const due = new Date(order.dueDateTime).getTime()
  const now = Date.now()
  const days = (due - now) / (1000 * 60 * 60 * 24)

  if (days < 0) {
    return {
      tone: "overdue" as const,
      label: "Overdue",
      detail: `Past due by ${Math.ceil(Math.abs(days))} day(s)`,
      className: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    }
  }

  if (days <= 2) {
    return {
      tone: "warning" as const,
      label: "Due soon",
      detail: `${Math.ceil(days)} day(s) remaining`,
      className:
        "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    }
  }

  return {
    tone: "ok" as const,
    label: "On track",
    detail: `${Math.ceil(days)} day(s) remaining`,
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  }
}
