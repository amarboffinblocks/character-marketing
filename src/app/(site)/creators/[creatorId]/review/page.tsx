import { notFound, redirect } from "next/navigation"

import { CreatorReviewFormView } from "@/features/site/reviews/components/creator-review-form-view"
import { getCreatorProfileById } from "@/features/site/creator-profile"
import { createServerSupabaseClient } from "@/lib/supabase/server"

type CreatorReviewPageProps = {
  params: Promise<{ creatorId: string }>
  searchParams: Promise<{ orderId?: string }>
}

export default async function CreatorReviewPage({ params, searchParams }: CreatorReviewPageProps) {
  const { creatorId } = await params
  const { orderId } = await searchParams
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const normalizedOrderId = typeof orderId === "string" ? orderId.trim() : ""
  if (normalizedOrderId) {
    const { data: order } = await supabase
      .from("orders")
      .select("id, creator_id, buyer_id, status")
      .eq("id", normalizedOrderId)
      .eq("buyer_id", user.id)
      .eq("creator_id", creatorId)
      .maybeSingle()

    if (!order || order.status !== "delivered") {
      redirect("/orders")
    }
  }

  const profile = await getCreatorProfileById(creatorId)
  if (!profile) {
    notFound()
  }

  return (
    <CreatorReviewFormView
      creator={{
        id: profile.id,
        name: profile.name,
        handle: profile.handle,
        avatar: profile.avatar,
        tagline: profile.tagline,
      }}
      orderId={normalizedOrderId}
    />
  )
}
