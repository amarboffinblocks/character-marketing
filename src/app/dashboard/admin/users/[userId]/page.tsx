import { AdminUserProfileView } from "@/features/admin/admin-user-profile-view"

type PageProps = {
  params: Promise<{ userId: string }>
}

export default async function AdminUserProfilePage({ params }: PageProps) {
  const { userId } = await params
  return <AdminUserProfileView userId={userId} />
}
