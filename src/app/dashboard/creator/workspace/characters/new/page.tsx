import { Container } from "@/components/shared"
import { CharacterCreateFormView } from "@/features/creator/workspace/characters/character-create-form-view"

export default function CreatorWorkspaceCharacterCreatePage() {
  return (
    <Container size={"lg"}>
      <CharacterCreateFormView />
    </Container>
  )
}
