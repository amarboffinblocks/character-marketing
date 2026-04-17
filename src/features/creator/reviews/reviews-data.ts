export type ReviewRating = 1 | 2 | 3 | 4 | 5

export type CreatorReview = {
  id: string
  buyerName: string
  buyerAvatarUrl?: string
  rating: ReviewRating
  packageName: string
  orderId: string
  comment: string
  submittedAt: string
  reply?: string
  tags: string[]
}

export const creatorReviews: CreatorReview[] = [
  {
    id: "rev-1",
    buyerName: "Ava Thompson",
    rating: 5,
    packageName: "Character Premium Package",
    orderId: "ORD-3021",
    comment:
      "Exceptional delivery. The character sheet matched our brand voice and the turnaround was fast.",
    submittedAt: "2h ago",
    reply: "Thank you Ava — excited to work with you again!",
    tags: ["Communication", "Quality"],
  },
  {
    id: "rev-2",
    buyerName: "Noah Patel",
    rating: 5,
    packageName: "Lorebook Worldbuilding Pack",
    orderId: "ORD-3017",
    comment:
      "Incredibly structured lore with very clean keyword relationships. Perfect for our visual novel.",
    submittedAt: "1d ago",
    tags: ["Structure", "Detail"],
  },
  {
    id: "rev-3",
    buyerName: "Mia Robinson",
    rating: 4,
    packageName: "Avatar Starter Pack",
    orderId: "ORD-3008",
    comment:
      "Great avatar style, would have loved one more alt variant. Overall very satisfied with the result.",
    submittedAt: "3d ago",
    tags: ["Style", "Value"],
  },
  {
    id: "rev-4",
    buyerName: "Ethan Kim",
    rating: 5,
    packageName: "Character Premium Package",
    orderId: "ORD-2999",
    comment: "Perfect character pack and the additional expression sheet was a nice touch.",
    submittedAt: "5d ago",
    tags: ["Bonus", "Quality"],
  },
  {
    id: "rev-5",
    buyerName: "Sophia Martin",
    rating: 3,
    packageName: "Avatar Starter Pack",
    orderId: "ORD-2985",
    comment: "Good visuals but communication could be faster during revisions.",
    submittedAt: "1w ago",
    tags: ["Communication"],
  },
]

export function getReviewMetrics(reviews: CreatorReview[]) {
  const total = reviews.length
  const average =
    total === 0
      ? 0
      : reviews.reduce((acc, item) => acc + item.rating, 0) / total

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star: star as ReviewRating,
    count: reviews.filter((review) => review.rating === star).length,
    percentage:
      total === 0
        ? 0
        : Math.round((reviews.filter((review) => review.rating === star).length / total) * 100),
  }))

  const repliedRate =
    total === 0
      ? 0
      : Math.round((reviews.filter((review) => review.reply).length / total) * 100)

  return {
    total,
    average: Math.round(average * 10) / 10,
    distribution,
    repliedRate,
  }
}
