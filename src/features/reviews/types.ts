export type ReviewStatus = "published" | "pending"

export type CreatorReviewRecord = {
  id: string
  creatorId: string
  reviewerName: string
  reviewerAvatar: string | null
  reviewerInitials: string
  rating: number
  title: string
  body: string
  createdAt: string
  status: ReviewStatus
}

export type CreateCreatorReviewInput = {
  creatorId: string
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
