import { CreatorProfileView } from "@/features/creator/profile/creator-profile-view"

export default function ProfilePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 pt-24 pb-8 sm:px-6 lg:px-8">
      <CreatorProfileView role="user" />
    </main>
  )
}
