import Link from "next/link"
import { Flag, MessageSquare } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  context?: "creator" | "admin"
}

export function OrdersDataTable({ orders, context = "creator" }: OrdersDataTableProps) {
  const isAdmin = context === "admin"

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          {isAdmin && <TableHead>Creator</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          {!isAdmin && <TableHead>Due date</TableHead>}
          <TableHead>Last updated</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-[160px] text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const overdue = isOrderOverdue(order)
          const customerChatHref = `/dashboard/admin/messages?order=${encodeURIComponent(order.rawOrderId ?? order.id)}&target=${order.buyerId}`
          const creatorChatHref = `/dashboard/admin/messages?order=${encodeURIComponent(order.rawOrderId ?? order.id)}&target=${order.creatorId}`

          return (
            <TableRow
              key={order.id}
              className={cn(overdue && "bg-destructive/5 hover:bg-destructive/10")}
            >
              <TableCell className="py-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{order.packageName}</span>
                    {overdue && !isAdmin ? (
                      <Badge variant="secondary" className="bg-destructive/15 text-destructive">
                        Overdue
                      </Badge>
                    ) : null}
                  </div>
                  <span className="text-xs text-muted-foreground">{order.id}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium">{order.customerName}</span>
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <span className="text-sm font-medium text-foreground">{order.creatorName}</span>
                </TableCell>
              )}
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
              {!isAdmin && (
                <TableCell>
                  <span className={cn("font-medium", getDueDateTone(order))}>{order.dueDate}</span>
                </TableCell>
              )}
              <TableCell>{order.updatedAt}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(order.amount)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <OrderRowActions order={order} context={context} />
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
