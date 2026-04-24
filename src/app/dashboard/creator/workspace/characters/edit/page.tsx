import { Container } from "@/components/shared"
import { CharacterCreateFormView } from "@/features/creator/workspace/characters/character-create-form-view"

export default function CreatorWorkspaceCharacterEditPage() {
  return (
    <Container size="full" className="px-2 sm:px-4 lg:px-6">
      <CharacterCreateFormView />
    </Container>
  )
}
