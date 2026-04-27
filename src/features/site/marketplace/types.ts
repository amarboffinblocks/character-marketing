export type Creator = {
  id: string
  name: string
  handle: string
  tagline: string
  languages: string[]
  avatar: string
  coverImage: string
  rating: number
  reviewCount: number
  startingPrice: number
  responseTime: string
  isVerified: boolean
  isAvailable: boolean
  specialties: string[]
  completedOrders: number
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
