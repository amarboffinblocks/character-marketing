"use client"

import { useMemo, useState } from "react"

import { Container } from "@/components/shared"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { CreatorMarketplaceFilterSidebar } from "@/features/site/marketplace/components/filter-sidebar"
import { CreatorMarketplaceResultsToolbar } from "@/features/site/marketplace/components/results-toolbar"
import { CreatorProfileCard } from "@/features/site/marketplace/components/creator-card"
import { filterCreators, getPaginationRange } from "@/features/site/marketplace/filters"
import type {
  Creator,
  CreatorMarketplaceCategory,
  CreatorMarketplaceSortOption,
} from "@/features/site/marketplace/types"

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
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const [savedIds, setSavedIds] = useState<string[]>(() => creators.map((c) => c.id))
  const isSavedPage = typeof window !== "undefined" && window.location.pathname.includes("saved-creators")

  const availableLanguages = useMemo(() => {
    const set = new Set<string>()
    creators.forEach((c) => {
      if (Array.isArray(c.languages)) {
        c.languages.forEach((l) => set.add(l))
      }
    })
    return Array.from(set).sort()
  }, [creators])

  const filteredCreators = useMemo(
    () => {
      const base = isSavedPage ? creators.filter((c) => savedIds.includes(c.id)) : creators
      return filterCreators(base, categories, {
        query,
        sort,
        maxPrice,
        selectedTagIds,
        selectedLanguages,
      })
    },
    [
      creators,
      categories,
      query,
      sort,
      maxPrice,
      selectedTagIds,
      selectedLanguages,
      savedIds,
      isSavedPage,
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

  const handleLanguagesChange = (languages: string[]) => {
    setSelectedLanguages(languages)
    setCurrentPage(1)
  }

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((current) =>
      current.includes(tagId)
        ? current.filter((value) => value !== tagId)
        : [...current, tagId]
    )
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setQuery("")
    setSort(sortOptions[0]?.id ?? "relevance")
    setMaxPrice(DEFAULT_MAX_PRICE)
    setSelectedTagIds([])
    setSelectedLanguages([])
    setCurrentPage(1)
  }

  return (
    <main className=" to-muted/20 ">
      <Container size="xl" paddingY="sm" className="mt-20" >
        <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          <div className="sticky top-20">
            <CreatorMarketplaceFilterSidebar
              sort={sort}
              sortOptions={sortOptions}
              maxPrice={maxPrice}
              availableLanguages={availableLanguages}
              selectedLanguages={selectedLanguages}
              onSortChange={handleSortChange}
              onMaxPriceChange={handleMaxPriceChange}
              onLanguagesChange={handleLanguagesChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          <section>
            <CreatorMarketplaceResultsToolbar
              query={query}
              resultCount={filteredCreators.length}
              tags={categories}
              selectedTagIds={selectedTagIds}
              onQueryChange={handleQueryChange}
              onToggleTag={handleToggleTag}
            />

            <ul className="grid list-none gap-4 mt-4 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedCreators.map((creator) => (
                <li key={creator.id}>
                  <CreatorProfileCard
                    creator={creator}
                    featured={creator.isVerified && creator.rating >= 4.8}
                    onUnsave={() => setSavedIds((current) => current.filter((id) => id !== creator.id))}
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
