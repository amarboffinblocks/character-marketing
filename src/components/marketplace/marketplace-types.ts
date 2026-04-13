import type { Creator } from "@/components/cards/creator-card"

export type MarketplaceCategory = {
  id: string
  name: string
  description: string
  count: number
  icon: string
}

export type MarketplaceSortOption = {
  id: string
  label: string
}

export type MarketplaceFilters = {
  query: string
  sort: string
  maxPrice: number
  categoryIds: string[]
  verifiedOnly: boolean
  availableOnly: boolean
}

export type MarketplaceViewProps = {
  creators: Creator[]
  categories: MarketplaceCategory[]
  sortOptions: MarketplaceSortOption[]
}
