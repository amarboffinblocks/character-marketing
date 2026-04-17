import {
  BuyerRequestsCard,
  BuyerInstructionsCard,
  ConversationCard,
  DeliveryCard,
  OrderDetailsHeader,
  OrderOverviewCard,
  OrderQuickSidebar,
  PackageDetailsCard,
  RevisionsCard,
  WorkProgressCard,
} from "@/features/creator/orders/components/order-details-sections"
import { getOrderDetailsData } from "@/features/creator/orders/order-details-data"
import type { CreatorOrder } from "@/features/creator/orders/types"

type OrderDetailsViewProps = {
  order: CreatorOrder
}

export function OrderDetailsView({ order }: OrderDetailsViewProps) {
  const details = getOrderDetailsData(order)

  return (
    <div className="flex flex-col gap-6">
      <OrderDetailsHeader order={order} />

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <OrderOverviewCard order={order} details={details} />
          <PackageDetailsCard details={details} />
          <BuyerRequestsCard details={details} />
          <BuyerInstructionsCard details={details} />
          <ConversationCard details={details} />
          <WorkProgressCard details={details} />
          <DeliveryCard />
          <RevisionsCard details={details} />
        </div>
        <OrderQuickSidebar order={order} />
      </section>
    </div>
  )
}
