import { AdminUsersView } from "@/features/admin"
import { getAdminDirectoryUsers } from "@/features/admin/admin-directory-data"

export default async function AdminUsersPage() {
  const users = await getAdminDirectoryUsers({ excludeCreators: true })
  return <AdminUsersView users={users} />
}
