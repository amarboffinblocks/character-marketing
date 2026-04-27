import type { CreatorMarketplaceSortOption } from "@/features/site/marketplace/types"

export const sortOptions: CreatorMarketplaceSortOption[] = [
  { id: "relevance", label: "Relevance" },
  { id: "rating", label: "Highest Rated" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "most-experienced", label: "Most Experienced" },
  { id: "fastest", label: "Fastest Delivery" },
]
