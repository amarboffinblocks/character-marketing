export type CreatorReviewRecord = {
  id: string
  creatorId: string
  reviewerId: string
  reviewerName: string
  reviewerAvatar: string | null
  reviewerInitials: string
  rating: number
  title: string
  body: string
  createdAt: string
  status: "published" | "pending" | "hidden"
  creatorReply?: string
  creatorRepliedAt?: string
}

export type CreateCreatorReviewInput = {
  creatorId: string
  reviewerId: string
  reviewerName: string
  reviewerAvatar?: string | null
  rating: number
  title?: string
  body: string
}

export type CreatorReviewAggregate = {
  averageRating: number
  reviewCount: number
}
