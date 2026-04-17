"use client"

import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type {
  OrderQuickFilter,
  OrderSortValue,
  OrderStatusFilter,
} from "@/features/creator/orders/utils"

const statusOptions: { label: string; value: OrderStatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "In Progress", value: "in_progress" },
  { label: "Waiting on Buyer", value: "waiting_on_buyer" },
  { label: "Review", value: "review" },
  { label: "Completed", value: "completed" },
]

const quickFilterOptions: { label: string; value: OrderQuickFilter }[] = [
  { label: "Due soon", value: "due_soon" },
  { label: "High value", value: "high_value" },
  { label: "Needs response", value: "needs_response" },
]

type OrdersToolbarProps = {
  search: string
  status: OrderStatusFilter
  sort: OrderSortValue
  quickFilters: OrderQuickFilter[]
  resultsCount: number
  onSearchChange: (value: string) => void
  onStatusChange: (value: OrderStatusFilter) => void
  onSortChange: (value: OrderSortValue) => void
  onQuickFilterToggle: (value: OrderQuickFilter) => void
  onResetFilters: () => void
}

export function OrdersToolbar({
  search,
  status,
  sort,
  quickFilters,
  resultsCount,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onQuickFilterToggle,
  onResetFilters,
}: OrdersToolbarProps) {
  const hasFilters =
    search.trim().length > 0 || status !== "all" || quickFilters.length > 0

  return (
    <section className="rounded-xl border border-border bg-card p-3 shadow-xs sm:p-4">
      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by order ID, buyer, or package"
            className="pl-8"
          />
        </div>

        <Select value={status} onValueChange={(value) => onStatusChange(value as OrderStatusFilter)}>
          <SelectTrigger aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(value) => onSortChange(value as OrderSortValue)}>
          <SelectTrigger aria-label="Sort orders">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="due-asc">Due date (soonest)</SelectItem>
            <SelectItem value="due-desc">Due date (latest)</SelectItem>
            <SelectItem value="amount-desc">Highest value</SelectItem>
            <SelectItem value="updated-desc">Recently updated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {quickFilterOptions.map((filter) => {
          const active = quickFilters.includes(filter.value)
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onQuickFilterToggle(filter.value)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          )
        })}
        <span className="ml-auto text-xs text-muted-foreground">
          {resultsCount} {resultsCount === 1 ? "order" : "orders"}
        </span>
      </div>

      {hasFilters ? (
        <div className="mt-3 flex items-center justify-between border-t border-border/80 pt-3">
          <p className="text-xs text-muted-foreground">Filters are applied</p>
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onResetFilters}>
            Clear all
          </Button>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onStatusChange(option.value)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              status === option.value
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  )
}
