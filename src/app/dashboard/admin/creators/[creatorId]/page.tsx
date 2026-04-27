import { AdminCreatorProfileView } from "@/features/admin/admin-creator-profile-view"

type PageProps = {
  params: Promise<{ creatorId: string }>
}

export default async function AdminCreatorProfilePage({ params }: PageProps) {
  const { creatorId } = await params
  return <AdminCreatorProfileView creatorId={creatorId} />
}
