"use client"

import { Search } from "lucide-react"
import { useMemo } from "react"

import { Input } from "@/components/ui/input"
import { MultiSelect } from "@/components/ui/multi-select"
import type { CreatorMarketplaceCategory } from "@/features/site/marketplace/types"

type CreatorMarketplaceResultsToolbarProps = {
  query: string
  resultCount: number
  tags: CreatorMarketplaceCategory[]
  selectedTagIds: string[]
  onQueryChange: (query: string) => void
  onToggleTag: (tagId: string) => void
}

export function CreatorMarketplaceResultsToolbar({
  query,
  resultCount,
  tags,
  selectedTagIds,
  onQueryChange,
  onToggleTag,
}: CreatorMarketplaceResultsToolbarProps) {
  const tagOptions = useMemo(
    () =>
      tags.map((tag) => ({
        value: tag.id,
        label: tag.name,
      })),
    [tags]
  )

  const handleTagSelectionChange = (nextSelectedTagIds: string[]) => {
    const currentSet = new Set(selectedTagIds)
    const nextSet = new Set(nextSelectedTagIds)

    tags.forEach((tag) => {
      const isCurrentlySelected = currentSet.has(tag.id)
      const shouldBeSelected = nextSet.has(tag.id)

      if (isCurrentlySelected !== shouldBeSelected) {
        onToggleTag(tag.id)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 grid-cols-6">
        <div className="relative col-span-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.currentTarget.value)}
            className="h-10 pl-9"
            placeholder="Search creators, skills..."
            aria-label="Search creators"
          />
        </div>
<div className="col-span-2">
  <MultiSelect
          options={tagOptions}
          defaultValue={selectedTagIds}
          onValueChange={handleTagSelectionChange}
          placeholder="Select creator skills"
          hideSelectAll
          maxCount={1}
          searchable
          className="w-full bg-background"
        />
</div>
      
      </div>

      <p className="pb-4 text-sm text-muted-foreground">Showing {resultCount} creators</p>
    </div>
  )
}
