"use client"

import { useEffect, useMemo, useState } from "react"

import { CreatorCard, type Creator } from "@/components/cards/creator-card"
import { Container } from "@/components/elements"
import { MarketplaceFilterSidebar } from "@/components/marketplace/marketplace-filter-sidebar"
import { MarketplaceResultsToolbar } from "@/components/marketplace/marketplace-results-toolbar"
import type { MarketplaceCategory, MarketplaceSortOption } from "@/components/marketplace/marketplace-types"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const DEFAULT_MAX_PRICE = 500
const PAGE_SIZE = 2

type MarketplaceViewProps = {
  creators: Creator[]
  categories: MarketplaceCategory[]
  sortOptions: MarketplaceSortOption[]
}

function getPaginationRange(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
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

function matchesCategory(creator: Creator, category: MarketplaceCategory) {
  const categoryName = category.name.toLowerCase()

  return creator.specialties.some((specialty) => specialty.toLowerCase().includes(categoryName))
}

function sortCreators(creators: Creator[], sort: string) {
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
    case "newest":
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

export function MarketplaceView({ creators, categories, sortOptions }: MarketplaceViewProps) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState(sortOptions[0]?.id ?? "relevance")
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [availableOnly, setAvailableOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const filteredCreators = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const selectedCategories = categories.filter((category) =>
      selectedCategoryIds.includes(category.id)
    )

    const filtered = creators.filter((creator) => {
      const inPriceRange = creator.startingPrice <= maxPrice
      const matchesVerifiedFilter = !verifiedOnly || creator.isVerified
      const matchesAvailabilityFilter = !availableOnly || creator.isAvailable

      const matchesSearch =
        normalizedQuery.length === 0 ||
        creator.name.toLowerCase().includes(normalizedQuery) ||
        creator.handle.toLowerCase().includes(normalizedQuery) ||
        creator.specialties.some((specialty) =>
          specialty.toLowerCase().includes(normalizedQuery)
        )

      const matchesSelectedCategories =
        selectedCategories.length === 0 ||
        selectedCategories.some((category) => matchesCategory(creator, category))

      return (
        inPriceRange &&
        matchesVerifiedFilter &&
        matchesAvailabilityFilter &&
        matchesSearch &&
        matchesSelectedCategories
      )
    })

    return sortCreators(filtered, sort)
  }, [
    availableOnly,
    categories,
    creators,
    maxPrice,
    query,
    selectedCategoryIds,
    sort,
    verifiedOnly,
  ])

  const totalPages = Math.max(1, Math.ceil(filteredCreators.length / PAGE_SIZE))
  const paginatedCreators = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE
    return filteredCreators.slice(startIndex, startIndex + PAGE_SIZE)
  }, [currentPage, filteredCreators])

  useEffect(() => {
    setCurrentPage(1)
  }, [query, sort, maxPrice, selectedCategoryIds, verifiedOnly, availableOnly])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((value) => value !== categoryId)
        : [...current, categoryId]
    )
  }

  const handleClearFilters = () => {
    setQuery("")
    setSort(sortOptions[0]?.id ?? "relevance")
    setMaxPrice(DEFAULT_MAX_PRICE)
    setSelectedCategoryIds([])
    setVerifiedOnly(false)
    setAvailableOnly(false)
    setCurrentPage(1)
  }

  return (
    <main className="border-t border-border/40 bg-linear-to-b from-background to-muted/20">
      <Container size="xl" paddingY="sm">
        {/* <header className="mb-8 border-b border-border/50 pb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Browse creators</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Discover vetted specialists in AI characters and worldbuilding.
          </p>
        </header> */}

        <div className="  grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          <div className=" sticky top-20">
            <MarketplaceFilterSidebar
              categories={categories}
              maxPrice={maxPrice}
              selectedCategoryIds={selectedCategoryIds}
              verifiedOnly={verifiedOnly}
              availableOnly={availableOnly}
              onMaxPriceChange={setMaxPrice}
              onToggleCategory={handleToggleCategory}
              onVerifiedOnlyChange={setVerifiedOnly}
              onAvailableOnlyChange={setAvailableOnly}
              onClearFilters={handleClearFilters}
            />
          </div>

          <section>
            <MarketplaceResultsToolbar
              query={query}
              sort={sort}
              resultCount={filteredCreators.length}
              sortOptions={sortOptions}
              onQueryChange={setQuery}
              onSortChange={setSort}
            />

            <ul className="grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedCreators.map((creator) => (
                <li key={creator.id}>
                  <CreatorCard creator={creator} featured={creator.isVerified && creator.rating >= 4.8} />
                </li>
              ))}
            </ul>

            {filteredCreators.length > PAGE_SIZE ? (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>

                  {getPaginationRange(currentPage, totalPages).map((item, index) => (
                    <PaginationItem key={`${item}-${index}`}>
                      {item === "ellipsis" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          isActive={item === currentPage}
                          onClick={() => setCurrentPage(item)}
                        >
                          {item}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            ) : null}

            {filteredCreators.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-border/80 bg-background p-8 text-center">
                <p className="font-medium">No creators found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try expanding your filters or clearing your search terms.
                </p>
              </div>
            ) : null}
          </section>
        </div>
      </Container>
    </main>
  )
}
