"use client"

import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CreatorMarketplaceSortOption } from "@/features/site/marketplace/types"

type CreatorMarketplaceResultsToolbarProps = {
  query: string
  sort: string
  resultCount: number
  sortOptions: CreatorMarketplaceSortOption[]
  onQueryChange: (query: string) => void
  onSortChange: (sort: string) => void
}

export function CreatorMarketplaceResultsToolbar({
  query,
  sort,
  resultCount,
  sortOptions,
  onQueryChange,
  onSortChange,
}: CreatorMarketplaceResultsToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.currentTarget.value)}
            className="h-10 pl-9"
            placeholder="Search creators, specialties..."
            aria-label="Search creators"
          />
        </div>
        <Select value={sort} onValueChange={(value) => onSortChange(String(value ?? ""))}>
          <SelectTrigger aria-label="Sort creators">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="pb-4 text-sm text-muted-foreground">Showing {resultCount} creators</p>
    </div>
  )
}
