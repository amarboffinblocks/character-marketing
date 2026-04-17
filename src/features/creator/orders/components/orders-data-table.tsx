import { Flag } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

type OrdersDataTableProps = {
  orders: CreatorOrder[]
}

export function OrdersDataTable({ orders }: OrdersDataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Due date</TableHead>
          <TableHead>Last updated</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-[160px] text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const overdue = isOrderOverdue(order)
          return (
            <TableRow
              key={order.id}
              className={cn(overdue && "bg-destructive/5 hover:bg-destructive/10")}
            >
              <TableCell className="py-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{order.id}</span>
                    {overdue ? (
                      <Badge variant="secondary" className="bg-destructive/15 text-destructive">
                        Overdue
                      </Badge>
                    ) : null}
                  </div>
                  <span className="text-xs text-muted-foreground">{order.packageName}</span>
                </div>
              </TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5">
                  <Flag className={cn("size-3.5", getOrderPriorityClass(order.priority))} />
                  <span className={cn("capitalize", getOrderPriorityClass(order.priority))}>
                    {order.priority}
                  </span>
                </span>
              </TableCell>
              <TableCell>
                <span className={cn("font-medium", getDueDateTone(order))}>{order.dueDate}</span>
              </TableCell>
              <TableCell>{order.updatedAt}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(order.amount)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Link
                    href={`/dashboard/creator/orders/${order.id.toLowerCase()}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7")}
                  >
                    View
                  </Link>
                  <OrderRowActions order={order} />
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
