import { Container } from "@/components/shared"
import { PersonaReadView } from "@/features/creator/workspace/personas/persona-read-view"

export default function CreatorWorkspacePersonaViewPage() {
  return (
    <Container size="full" className="px-2 sm:px-4 lg:px-6">
      <PersonaReadView />
    </Container>
  )
}
