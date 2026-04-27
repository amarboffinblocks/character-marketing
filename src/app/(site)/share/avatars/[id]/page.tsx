import { Container } from "@/components/shared"
import { AvatarReadView } from "@/features/creator/workspace/avatars/avatar-read-view"

export default async function PublicAvatarSharePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  console.log("id", id)
  return (
    <Container size="xl" className="mt-14 px-2 py-6 sm:px-4 lg:px-6">
      <AvatarReadView
        entityId={id}
        apiPathPrefix="/api/public/avatars"
        backHref="/"
        backLabel="Back to Home"
      />
    </Container>
  )
}
