import { Container } from "@/components/shared"
import { LorebookCreateFormView } from "@/features/creator/workspace/lorebooks/lorebook-create-form-view"

export default function CreatorWorkspaceLorebookEditPage() {
  return (
    <Container size="full" className="px-2 sm:px-4 lg:px-6">
      <LorebookCreateFormView />
    </Container>
  )
}
