import { notFound } from "next/navigation"

import { OrderDetailsView } from "@/features/creator/orders/components/order-details-view"
import { findCreatorOrderBySlug } from "@/features/creator/orders/data"

type OrderDetailsPageProps = {
  params: Promise<{ orderId: string }>
}

export default async function CreatorOrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const { orderId } = await params
  const order = findCreatorOrderBySlug(orderId)

  if (!order) {
    notFound()
  }

  return <OrderDetailsView order={order} />
}
