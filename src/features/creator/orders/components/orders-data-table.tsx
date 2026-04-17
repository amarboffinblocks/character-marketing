import { Flag } from "lucide-react"
import Link from "next/link"

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
import { OrderStatusBadge } from "@/features/creator/orders/components/order-status-badge"
import type { CreatorOrder } from "@/features/creator/orders/types"
import {
  formatCurrency,
  getDueDateTone,
  getOrderPriorityClass,
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
          <TableHead className="w-[132px] text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="py-4">
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{order.id}</span>
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
              <Link
                href={`/dashboard/creator/orders/${order.id.toLowerCase()}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7")}
              >
                View Order
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
