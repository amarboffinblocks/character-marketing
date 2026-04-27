import { Container } from "@/components/shared"
import { CharacterReadView } from "@/features/creator/workspace/characters/character-read-view"

export default async function PublicCharacterSharePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <Container size="xl" className="mt-14 px-2 py-6 sm:px-4 lg:px-6">
      <CharacterReadView
        entityId={id}
        apiPathPrefix="/api/public/characters"
        backHref="/"
        backLabel="Back to Home"
      />
    </Container>
  )
}
