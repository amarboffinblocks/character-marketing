import Link from "next/link"
import { Flag } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { OrderRowActions } from "@/features/creator/orders/components/order-row-actions"
import { OrderStatusBadge } from "@/features/creator/orders/components/order-status-badge"
import type { CreatorOrder } from "@/features/creator/orders/types"
import {
  formatCurrency,
  getDueDateTone,
  getOrderPriorityClass,
  isOrderOverdue,
} from "@/features/creator/orders/utils"

type OrdersMobileListProps = {
  orders: CreatorOrder[]
}

export function OrdersMobileList({ orders }: OrdersMobileListProps) {
  return (
    <ul className="divide-y divide-border md:hidden">
      {orders.map((order) => {
        const overdue = isOrderOverdue(order)
        return (
          <li
            key={order.id}
            className={cn("space-y-3 px-4 py-4", overdue && "bg-destructive/5")}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-semibold text-foreground">{order.packageName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {order.id} · {order.customerName}
                </p>
                {overdue ? (
                  <Badge variant="secondary" className="bg-destructive/15 text-destructive">
                    Overdue
                  </Badge>
                ) : null}
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <p className="text-muted-foreground">
                Due:{" "}
                <span className={cn("font-medium", getDueDateTone(order))}>{order.dueDate}</span>
              </p>
              <p className="text-muted-foreground">
                Updated: <span className="font-medium text-foreground">{order.updatedAt}</span>
              </p>
              <p className="text-muted-foreground">
                Amount:{" "}
                <span className="font-medium text-foreground">{formatCurrency(order.amount)}</span>
              </p>
              <p className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Flag className={cn("size-3.5", getOrderPriorityClass(order.priority))} />
                <span className={cn("capitalize font-medium", getOrderPriorityClass(order.priority))}>
                  {order.priority}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/creator/orders/${order.id.toLowerCase()}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 flex-1")}
              >
                View Order
              </Link>
              <OrderRowActions order={order} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
