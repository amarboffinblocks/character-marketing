import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { CreatorOrderStatus } from "@/features/creator/orders/types"
import { orderStatusClassMap, orderStatusLabelMap } from "@/features/creator/orders/utils"

type OrderStatusBadgeProps = {
  status: CreatorOrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <Badge variant="secondary" className={cn("font-medium", orderStatusClassMap[status])}>
      {orderStatusLabelMap[status]}
    </Badge>
  )
}
