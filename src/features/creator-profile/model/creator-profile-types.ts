import type { Creator } from "@/features/creator-marketplace/model/creator-marketplace-types"

/** Sellable offering shown on the profile sidebar */
export type CreatorServicePackage = {
  id: string
  title: string
  price: number
  description: string
  scopeLabel: string
  tokensLabel: string
  deliveryDays: number
  revisionCount: number
  includedHeading: string
  includedItems: string[]
}

export type CreatorProfileReview = {
  id: string
  authorName: string
  rating: number
  body: string
  dateLabel: string
}

export type CreatorProfileFaqItem = {
  id: string
  question: string
  answer: string
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
  reviews: CreatorProfileReview[]
  faqItems: CreatorProfileFaqItem[]
}
