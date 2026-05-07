import { notFound } from "next/navigation"

import { OrderDetailsView } from "@/features/creator/orders/components/order-details-view"
import { fetchAdminOrders } from "@/features/admin/admin-orders"

type AdminOrderDetailsPageProps = {
  params: Promise<{ orderId: string }>
}

export default async function AdminOrderDetailsPage({ params }: AdminOrderDetailsPageProps) {
  const { orderId } = await params
  const orders = await fetchAdminOrders()
  const order = orders.find(
    (item) => item.rawOrderId === orderId || item.id.toLowerCase() === orderId.toLowerCase()
  )

  if (!order) {
    notFound()
  }

  return (
    <OrderDetailsView
      order={order}
      readOnly
      messageHref={`/dashboard/admin/messages?order=${encodeURIComponent(order.rawOrderId ?? order.id)}`}
      messageLabel="Open messages"
    />
  )
}
