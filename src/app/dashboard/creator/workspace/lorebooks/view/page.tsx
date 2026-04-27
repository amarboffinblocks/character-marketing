import { Container } from "@/components/shared"
import { LorebookReadView } from "@/features/creator/workspace/lorebooks/lorebook-read-view"

export default function CreatorWorkspaceLorebookViewPage() {
  return (
    <Container size="full" className="px-2 sm:px-4 lg:px-6">
      <LorebookReadView />
    </Container>
  )
}
