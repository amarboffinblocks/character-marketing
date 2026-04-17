import Link from "next/link"
import { Flag } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { OrderStatusBadge } from "@/features/creator/orders/components/order-status-badge"
import type { CreatorOrder } from "@/features/creator/orders/types"
import {
  formatCurrency,
  getDueDateTone,
  getOrderPriorityClass,
} from "@/features/creator/orders/utils"

type OrdersMobileListProps = {
  orders: CreatorOrder[]
}

export function OrdersMobileList({ orders }: OrdersMobileListProps) {
  return (
    <ul className="divide-y divide-border md:hidden">
      {orders.map((order) => (
        <li key={order.id} className="space-y-3 px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{order.packageName}</p>
              <p className="text-xs text-muted-foreground">
                {order.id} · {order.customerName}
              </p>
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

          <Link
            href={`/dashboard/creator/orders/${order.id.toLowerCase()}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 w-full")}
          >
            View Order
          </Link>
        </li>
      ))}
    </ul>
  )
}
