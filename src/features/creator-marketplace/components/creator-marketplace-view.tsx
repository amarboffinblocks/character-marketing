"use client"

import { useMemo, useState } from "react"

import { Container } from "@/components/elements"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { CreatorMarketplaceFilterSidebar } from "@/features/creator-marketplace/components/creator-marketplace-filter-sidebar"
import { CreatorMarketplaceResultsToolbar } from "@/features/creator-marketplace/components/creator-marketplace-results-toolbar"
import { CreatorProfileCard } from "@/features/creator-marketplace/components/creator-profile-card"
import {
  filterCreators,
  getPaginationRange,
} from "@/features/creator-marketplace/lib/creator-marketplace-filters"
import type {
  Creator,
  CreatorMarketplaceCategory,
  CreatorMarketplaceSortOption,
} from "@/features/creator-marketplace/model/creator-marketplace-types"

const DEFAULT_MAX_PRICE = 500
const PAGE_SIZE = 6

type CreatorMarketplaceViewProps = {
  creators: Creator[]
  categories: CreatorMarketplaceCategory[]
  sortOptions: CreatorMarketplaceSortOption[]
}

export function CreatorMarketplaceView({
  creators,
  categories,
  sortOptions,
}: CreatorMarketplaceViewProps) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState(sortOptions[0]?.id ?? "relevance")
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [availableOnly, setAvailableOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const filteredCreators = useMemo(
    () =>
      filterCreators(creators, categories, {
        query,
        sort,
        maxPrice,
        selectedCategoryIds,
        verifiedOnly,
        availableOnly,
      }),
    [
      creators,
      categories,
      query,
      sort,
      maxPrice,
      selectedCategoryIds,
      verifiedOnly,
      availableOnly,
    ]
  )

  const totalPages = Math.max(1, Math.ceil(filteredCreators.length / PAGE_SIZE))
  const activePage = Math.min(currentPage, totalPages)
  const paginatedCreators = useMemo(() => {
    const startIndex = (activePage - 1) * PAGE_SIZE
    return filteredCreators.slice(startIndex, startIndex + PAGE_SIZE)
  }, [activePage, filteredCreators])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    setSort(value)
    setCurrentPage(1)
  }

  const handleMaxPriceChange = (value: number) => {
    setMaxPrice(value)
    setCurrentPage(1)
  }

  const handleVerifiedOnlyChange = (checked: boolean) => {
    setVerifiedOnly(checked)
    setCurrentPage(1)
  }

  const handleAvailableOnlyChange = (checked: boolean) => {
    setAvailableOnly(checked)
    setCurrentPage(1)
  }

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((value) => value !== categoryId)
        : [...current, categoryId]
    )
    setCurrentPage(1)
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
        <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          <div className="sticky top-20">
            <CreatorMarketplaceFilterSidebar
              categories={categories}
              maxPrice={maxPrice}
              selectedCategoryIds={selectedCategoryIds}
              verifiedOnly={verifiedOnly}
              availableOnly={availableOnly}
              onMaxPriceChange={handleMaxPriceChange}
              onToggleCategory={handleToggleCategory}
              onVerifiedOnlyChange={handleVerifiedOnlyChange}
              onAvailableOnlyChange={handleAvailableOnlyChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          <section>
            <CreatorMarketplaceResultsToolbar
              query={query}
              sort={sort}
              resultCount={filteredCreators.length}
              sortOptions={sortOptions}
              onQueryChange={handleQueryChange}
              onSortChange={handleSortChange}
            />

            <ul className="grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedCreators.map((creator) => (
                <li key={creator.id}>
                  <CreatorProfileCard
                    creator={creator}
                    featured={creator.isVerified && creator.rating >= 4.8}
                  />
                </li>
              ))}
            </ul>

            {filteredCreators.length > PAGE_SIZE ? (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={activePage === 1}
                    />
                  </PaginationItem>

                  {getPaginationRange(currentPage, totalPages).map((item, index) => (
                    <PaginationItem key={`${item}-${index}`}>
                      {item === "ellipsis" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          isActive={item === activePage}
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
                      disabled={activePage === totalPages}
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
