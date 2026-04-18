import { allCreators } from "@/features/site/marketplace"
import { AdminCreatorProfileView } from "@/features/admin/admin-creator-profile-view"

type PageProps = {
  params: Promise<{ creatorId: string }>
}

export function generateStaticParams() {
  return allCreators.map((c) => ({ creatorId: c.id }))
}

export default async function AdminCreatorProfilePage({ params }: PageProps) {
  const { creatorId } = await params
  return <AdminCreatorProfileView creatorId={creatorId} />
}
