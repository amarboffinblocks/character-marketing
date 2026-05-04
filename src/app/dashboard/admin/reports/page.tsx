import { AdminReportsView } from "@/features/admin"
import { fetchAdminReportsLiveMetrics } from "@/features/admin/admin-metrics"

export default async function AdminReportsPage() {
  const liveMetrics = await fetchAdminReportsLiveMetrics()
  return <AdminReportsView liveMetrics={liveMetrics} />
}
