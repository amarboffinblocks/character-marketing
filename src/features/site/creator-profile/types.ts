import type { Creator } from "@/features/site/marketplace/types"

/** Sellable offering shown on the profile sidebar */
export type CreatorServicePackage = {
  id: string
  title: string
  price: number
  discountedPrice?: number | null
  description: string
  scopeLabel: string
  tokensLabel: string
  deliveryDays: number
  revisionCount: number
  includedHeading: string
  includedItems: string[]
  packageHighlights?: string[]
  isRecommended?: boolean
}

export type CreatorProfileReview = {
  id: string
  reviewerName: string
  reviewerInitials: string
  reviewerAvatar: string | null
  authorName: string
  rating: number
  title?: string
  body: string
  dateLabel: string
  createdAt?: string
  status?: "published" | "pending"
}

export type CreatorProfileFaqItem = {
  id: string
  question: string
  answer: string
}

export type CreatorProfilePortfolioItem = {
  id: string
  title: string
  category: string
  skills: string[]
  description: string
  imageUrl: string
}

export type CreatorProfileTabId = "about" | "portfolio" | "reviews" | "faq"

/**
 * Full profile used by the creator profile page: marketplace `Creator` plus
 * extended fields (bio, packages, etc.). Built via `buildCreatorProfile`.
 */
export type CreatorProfile = Creator & {
  bio: string
  location: string
  memberSinceLabel: string
  completionRate: number
  languages: string[]
  /** Tags shown under Specialties (may include genres beyond marketplace filters) */
  displaySpecialties: string[]
  packages: CreatorServicePackage[]
  portfolioImageUrls: string[]
  portfolioItems: CreatorProfilePortfolioItem[]
  reviews: CreatorProfileReview[]
  faqItems: CreatorProfileFaqItem[]
}
