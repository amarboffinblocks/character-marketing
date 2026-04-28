import type { Creator, CreatorMarketplaceCategory } from "@/features/site/marketplace/types"

export type CreatorMarketplaceFilters = {
  query: string
  sort: string
  maxPrice: number
  selectedTagIds: string[]
  selectedLanguages: string[]
}


export function getPaginationRange(
  currentPage: number,
  totalPages: number
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages]
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages]
}

function matchesTag(creator: Creator, tag: CreatorMarketplaceCategory) {
  const tagName = tag.name.toLowerCase()
  return creator.specialties.some((specialty) => specialty.toLowerCase() === tagName)
}

export function sortCreators(creators: Creator[], sort: string) {
  const sortable = [...creators]

  switch (sort) {
    case "rating":
      return sortable.sort((a, b) => b.rating - a.rating)
    case "price-low":
      return sortable.sort((a, b) => a.startingPrice - b.startingPrice)
    case "price-high":
      return sortable.sort((a, b) => b.startingPrice - a.startingPrice)
    case "fastest":
      return sortable.sort((a, b) => a.responseTime.localeCompare(b.responseTime))
    case "most-experienced":
      return sortable.sort((a, b) => b.completedOrders - a.completedOrders)
    case "relevance":
    default:
      return sortable.sort((a, b) => {
        const scoreA = a.rating * 100 + a.reviewCount
        const scoreB = b.rating * 100 + b.reviewCount
        return scoreB - scoreA
      })
  }
}

export function filterCreators(
  creators: Creator[],
  tags: CreatorMarketplaceCategory[],
  filters: CreatorMarketplaceFilters
) {
  const normalizedQuery = filters.query.trim().toLowerCase()
  const selectedTags = tags.filter((tag) => filters.selectedTagIds.includes(tag.id))

  const filtered = creators.filter((creator) => {
    const inPriceRange = creator.startingPrice <= filters.maxPrice
    const matchesLanguage = 
      filters.selectedLanguages.length === 0 || 
      (creator.languages && creator.languages.some((lang) => filters.selectedLanguages.includes(lang)))
      
    const matchesSearch =
      normalizedQuery.length === 0 ||
      creator.name.toLowerCase().includes(normalizedQuery) ||
      creator.handle.toLowerCase().includes(normalizedQuery) ||
      creator.specialties.some((specialty) => specialty.toLowerCase().includes(normalizedQuery))

    const matchesSelectedTags = selectedTags.length === 0 || selectedTags.some((tag) => matchesTag(creator, tag))

    return (
      inPriceRange &&
      matchesLanguage &&
      matchesSearch &&
      matchesSelectedTags
    )
  })

  return sortCreators(filtered, filters.sort)
}
