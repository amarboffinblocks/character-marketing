import { CreatorAcceptedOrdersView } from "@/features/creator/orders"
import { fetchCreatorOrders } from "@/features/creator/orders/creator-orders"
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

  const orders = await fetchCreatorOrders(user.id)
  return <CreatorAcceptedOrdersView initialOrders={orders} />
}
