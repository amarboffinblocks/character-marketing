import { AdminCreatorsView } from "@/features/admin"
import { getAdminCreators } from "@/features/admin/admin-directory-data"

export default async function AdminCreatorsPage() {
  const creators = await getAdminCreators()
  return <AdminCreatorsView creators={creators} />
}
