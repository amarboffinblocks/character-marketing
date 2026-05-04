import { AdminDashboardView } from "@/features/admin"
import { fetchAdminDashboardLiveMetrics } from "@/features/admin/admin-metrics"

export default async function AdminDashboardPage() {
  const liveMetrics = await fetchAdminDashboardLiveMetrics()
  return <AdminDashboardView liveMetrics={liveMetrics} />
}
