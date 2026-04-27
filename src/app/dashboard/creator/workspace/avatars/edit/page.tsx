import { Container } from "@/components/shared"
import { AvatarCreateFormView } from "@/features/creator/workspace/avatars/avatar-create-form-view"

export default function CreatorWorkspaceAvatarEditPage() {
  return (
    <Container size="full" className="px-2 sm:px-4 lg:px-6">
      <AvatarCreateFormView />
    </Container>
  )
}
