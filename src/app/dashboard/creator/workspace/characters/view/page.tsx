import { Container } from "@/components/shared"
import { CharacterReadView } from "@/features/creator/workspace/characters/character-read-view"

export default function CreatorWorkspaceCharacterViewPage() {
  return (
    <Container size="full" className="px-2 sm:px-4 lg:px-6">
      <CharacterReadView />
    </Container>
  )
}
