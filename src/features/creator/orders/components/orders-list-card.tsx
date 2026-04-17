import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrdersDataTable } from "@/features/creator/orders/components/orders-data-table"
import { OrdersEmptyState } from "@/features/creator/orders/components/orders-empty-state"
import { OrdersMobileList } from "@/features/creator/orders/components/orders-mobile-list"
import type { CreatorOrder } from "@/features/creator/orders/types"

type OrdersListCardProps = {
  orders: CreatorOrder[]
  title: string
  description: string
  hasActiveFilters?: boolean
}

export function OrdersListCard({
  orders,
  title,
  description,
  hasActiveFilters = false,
}: OrdersListCardProps) {
  const hasOrders = orders.length > 0

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {hasOrders ? (
          <>
            <div className="hidden md:block">
              <OrdersDataTable orders={orders} />
            </div>
            <OrdersMobileList orders={orders} />
          </>
        ) : (
          <OrdersEmptyState hasActiveFilters={hasActiveFilters} />
        )}
      </CardContent>
    </Card>
  )
}
