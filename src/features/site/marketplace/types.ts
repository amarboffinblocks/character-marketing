export type Creator = {
  id: string
  name: string
  email?: string
  handle: string
  tagline: string
  shortBio: string
  longBio: string
  languages: string[]
  avatar: string
  coverImage: string
  rating: number
  reviewCount: number
  startingPrice: number
  responseTime: string
  isVerified: boolean
  isAvailable: boolean
  visibility?: "public" | "private" | "unlisted"
  specialties: string[]
  completedOrders: number
  faqItems?: { id: string; question: string; answer: string }[]
}

export type CreatorMarketplaceCategory = {
  id: string
  name: string
  description: string
  count: number
  icon: string
}

export type CreatorMarketplaceSortOption = {
  id: string
  label: string
}
