import { Container } from "@/components/shared"
import { BackgroundReadView } from "@/features/creator/workspace/backgrounds/background-read-view"

export default function CreatorWorkspaceBackgroundViewPage() {
  return (
    <Container size="full" className="px-2 sm:px-4 lg:px-6">
      <BackgroundReadView />
    </Container>
  )
}
