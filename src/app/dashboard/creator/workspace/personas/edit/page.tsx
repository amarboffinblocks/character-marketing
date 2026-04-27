import { Container } from "@/components/shared"
import { PersonaCreateFormView } from "@/features/creator/workspace/personas/persona-create-form-view"

export default function CreatorWorkspacePersonaEditPage() {
  return (
    <Container size="full" className="px-2 sm:px-4 lg:px-6">
      <PersonaCreateFormView />
    </Container>
  )
}
