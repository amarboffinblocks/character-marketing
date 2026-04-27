import { Container } from "@/components/shared"
import { BackgroundReadView } from "@/features/creator/workspace/backgrounds/background-read-view"

export default async function PublicBackgroundSharePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <Container size="xl" className="mt-14 px-2 py-6 sm:px-4 lg:px-6">
      <BackgroundReadView
        entityId={id}
        apiPathPrefix="/api/public/backgrounds"
        backHref="/"
        backLabel="Back to Home"
      />
    </Container>
  )
}
