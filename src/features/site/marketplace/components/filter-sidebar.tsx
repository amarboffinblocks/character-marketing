"use client"

import type { CreatorMarketplaceSortOption } from "@/features/site/marketplace/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { useMemo } from "react"

type CreatorMarketplaceFilterSidebarProps = {
  sort: string
  sortOptions: CreatorMarketplaceSortOption[]
  maxPrice: number
  availableLanguages: string[]
  selectedLanguages: string[]
  onSortChange: (sort: string) => void
  onMaxPriceChange: (maxPrice: number) => void
  onLanguagesChange: (languages: string[]) => void
  onClearFilters: () => void
}

export function CreatorMarketplaceFilterSidebar({
  sort,
  sortOptions,
  maxPrice,
  availableLanguages,
  selectedLanguages,
  onSortChange,
  onMaxPriceChange,
  onLanguagesChange,
  onClearFilters,
}: CreatorMarketplaceFilterSidebarProps) {
  const languageOptions = useMemo(
    () =>
      availableLanguages.map((lang) => ({
        value: lang,
        label: lang,
      })),
    [availableLanguages]
  )

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
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sort by</h3>
          <div className="mt-3">
            <Select value={sort} onValueChange={(value) => onSortChange(String(value ?? ""))}>
              <SelectTrigger aria-label="Sort creators" className="w-full bg-background">
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
            {availableLanguages.map((lang) => (
              <label key={lang} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={selectedLanguages.includes(lang)}
                  onChange={(event) => {
                    const isChecked = event.currentTarget.checked
                    if (isChecked) {
                      onLanguagesChange([...selectedLanguages, lang])
                    } else {
                      onLanguagesChange(selectedLanguages.filter((l) => l !== lang))
                    }
                  }}
                />
                {lang}
              </label>
            ))}
            {availableLanguages.length === 0 && (
              <span className="text-xs text-muted-foreground">No languages found</span>
            )}
          </div>
        </section>
      </div>
    </aside>
  )
}
