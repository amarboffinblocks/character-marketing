import { adminUserRecords } from "@/features/admin/admin-users-data"
import { AdminUserProfileView } from "@/features/admin/admin-user-profile-view"

type PageProps = {
  params: Promise<{ userId: string }>
}

export function generateStaticParams() {
  return adminUserRecords.map((u) => ({ userId: u.id }))
}

export default async function AdminUserProfilePage({ params }: PageProps) {
  const { userId } = await params
  return <AdminUserProfileView userId={userId} />
}
