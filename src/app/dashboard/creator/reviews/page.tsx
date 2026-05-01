import { CreatorReviewsView } from "@/features/creator/reviews/creator-reviews-view"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function CreatorReviewsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return <CreatorReviewsView creatorId={user?.id ?? ""} />
}
