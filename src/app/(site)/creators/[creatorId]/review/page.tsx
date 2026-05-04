import { notFound } from "next/navigation"

import { CreatorReviewFormView } from "@/features/site/reviews/components/creator-review-form-view"
import { getCreatorProfileById } from "@/features/site/creator-profile"

type CreatorReviewPageProps = {
  params: Promise<{ creatorId: string }>
  searchParams: Promise<{ orderId?: string }>
}

export default async function CreatorReviewPage({ params, searchParams }: CreatorReviewPageProps) {
  const { creatorId } = await params
  const { orderId } = await searchParams
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
      orderId={typeof orderId === "string" ? orderId : ""}
    />
  )
}
