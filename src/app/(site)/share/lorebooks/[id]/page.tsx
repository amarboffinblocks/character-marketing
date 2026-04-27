import { Container } from "@/components/shared"
import { LorebookReadView } from "@/features/creator/workspace/lorebooks/lorebook-read-view"

export default async function PublicLorebookSharePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <Container size="xl" className="mt-14 px-2 py-6 sm:px-4 lg:px-6">
      <LorebookReadView
        entityId={id}
        apiPathPrefix="/api/public/lorebooks"
        backHref="/"
        backLabel="Back to Home"
      />
    </Container>
  )
}
