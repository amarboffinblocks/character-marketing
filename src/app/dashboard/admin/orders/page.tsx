import { AdminOrdersView } from "@/features/admin"
import { fetchAdminOrders } from "@/features/admin/admin-orders"

export default async function AdminOrdersPage() {
  const orders = await fetchAdminOrders()
  return <AdminOrdersView initialOrders={orders} />
}
