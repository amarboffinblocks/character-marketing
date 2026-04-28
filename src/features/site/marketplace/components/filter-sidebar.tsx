"use client"

import { useMemo } from "react"
import type { CreatorMarketplaceCategory } from "@/features/site/marketplace/types"
import { MultiSelect } from "@/components/ui/multi-select"

type CreatorMarketplaceFilterSidebarProps = {
  tags: CreatorMarketplaceCategory[]
  maxPrice: number
  selectedTagIds: string[]
  verifiedOnly: boolean
  availableOnly: boolean
  onMaxPriceChange: (maxPrice: number) => void
  onToggleTag: (tagId: string) => void
  onVerifiedOnlyChange: (checked: boolean) => void
  onAvailableOnlyChange: (checked: boolean) => void
  onClearFilters: () => void
}

export function CreatorMarketplaceFilterSidebar({
  tags,
  maxPrice,
  selectedTagIds,
  verifiedOnly,
  availableOnly,
  onMaxPriceChange,
  onToggleTag,
  onVerifiedOnlyChange,
  onAvailableOnlyChange,
  onClearFilters,
}: CreatorMarketplaceFilterSidebarProps) {
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
    <aside className="rounded-xl border border-border/70 bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Filters</h2>
        <button
          type="button"
          className="text-xs font-medium text-primary hover:underline"
          onClick={onClearFilters}
        >
          Clear all
        </button>
      </div>

      <div className="mt-6 space-y-7">
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tags</h3>
          <div className="mt-3 space-y-2.5">
            <MultiSelect
              options={tagOptions}
              defaultValue={selectedTagIds}
              onValueChange={handleTagSelectionChange}
              placeholder="Select tags"
              hideSelectAll
              maxCount={2}
              searchable
              className="w-full"
              popoverClassName="w-[var(--anchor-width)]"
            />
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price range</h3>
          <div className="mt-4">
            <input
              type="range"
              min={25}
              max={500}
              step={5}
              value={maxPrice}
              onChange={(event) => onMaxPriceChange(Number(event.currentTarget.value))}
              className="w-full accent-primary"
              aria-label="Maximum starting price"
            />
            <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>$25</span>
              <span className="font-medium text-foreground">Up to ${maxPrice}</span>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick filters</h3>
          <div className="mt-3 space-y-2.5">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border-border"
                checked={verifiedOnly}
                onChange={(event) => onVerifiedOnlyChange(event.currentTarget.checked)}
              />
              Verified creators only
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border-border"
                checked={availableOnly}
                onChange={(event) => onAvailableOnlyChange(event.currentTarget.checked)}
              />
              Available now
            </label>
          </div>
        </section>
      </div>
    </aside>
  )
}
