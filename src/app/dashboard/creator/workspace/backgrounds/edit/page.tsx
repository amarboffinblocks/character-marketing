import { Container } from "@/components/shared"
import { BackgroundCreateFormView } from "@/features/creator/workspace/backgrounds/background-create-form-view"

export default function CreatorWorkspaceBackgroundEditPage() {
  return (
    <Container size="full" className="px-2 sm:px-4 lg:px-6">
      <BackgroundCreateFormView />
    </Container>
  )
}
