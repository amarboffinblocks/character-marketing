import { Container } from "@/components/shared"
import { AvatarReadView } from "@/features/creator/workspace/avatars/avatar-read-view"

export default function CreatorWorkspaceAvatarViewPage() {
  return (
    <Container size="full" className="px-2 sm:px-4 lg:px-6">
      <AvatarReadView />
    </Container>
  )
}
