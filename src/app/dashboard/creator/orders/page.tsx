import { CreatorOrdersView } from "@/features/creator/orders"
import { fetchCreatorRequests } from "@/features/creator/orders/creator-requests"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function CreatorOrdersPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const requests = await fetchCreatorRequests(user.id)
  return <CreatorOrdersView initialRequests={requests} />
}
