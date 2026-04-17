"use client"

import {
  AlertTriangle,
  ArrowUpDown,
  Clock,
  DollarSign,
  Filter,
  MessageSquareText,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
import {
  orderStatusLabelMap,
} from "@/features/creator/orders/utils"
import type {
  OrderQuickFilter,
  OrderSortValue,
  OrderStatusFilter,
} from "@/features/creator/orders/utils"

const quickFilterOptions: {
  label: string
  value: OrderQuickFilter
  icon: typeof Clock
}[] = [
  { label: "Due soon", value: "due_soon", icon: Clock },
  { label: "Overdue", value: "overdue", icon: AlertTriangle },
  { label: "High value", value: "high_value", icon: DollarSign },
  { label: "Needs response", value: "needs_response", icon: MessageSquareText },
]

const sortOptions: { label: string; value: OrderSortValue }[] = [
  { label: "Due date (soonest)", value: "due-asc" },
  { label: "Due date (latest)", value: "due-desc" },
  { label: "Highest value", value: "amount-desc" },
  { label: "Recently updated", value: "updated-desc" },
]

const statusOptions: { label: string; value: OrderStatusFilter }[] = [
  { label: "All statuses", value: "all" },
  { label: orderStatusLabelMap.new, value: "new" },
  { label: orderStatusLabelMap.in_progress, value: "in_progress" },
  { label: orderStatusLabelMap.waiting_on_buyer, value: "waiting_on_buyer" },
  { label: orderStatusLabelMap.review, value: "review" },
  { label: orderStatusLabelMap.completed, value: "completed" },
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
  const hasSearch = search.trim().length > 0
  const hasStatus = status !== "all"
  const activeFilterCount =
    (hasSearch ? 1 : 0) + (hasStatus ? 1 : 0) + quickFilters.length
  const hasFilters = activeFilterCount > 0

  const statusLabel =
    statusOptions.find((option) => option.value === status)?.label ?? "All statuses"

  return (
    <section className="rounded-2xl border border-border bg-card p-3 shadow-xs sm:p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Filter className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Filters</p>
              <p className="text-[11px] text-muted-foreground">
                Refine your work queue with search, status, and quick filters.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="h-6 gap-1 px-2 text-[11px]">
            <span className="font-medium text-foreground">{resultsCount}</span>
            {resultsCount === 1 ? "order" : "orders"}
          </Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-[1.6fr_1fr_1fr]">
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
            {hasSearch ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => onSearchChange("")}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>

          <Select
            value={status}
            onValueChange={(value) => onStatusChange(value as OrderStatusFilter)}
          >
            <SelectTrigger aria-label="Filter by status">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
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
              <ArrowUpDown className="size-4 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Quick filters:</span>
          {quickFilterOptions.map((filter) => {
            const Icon = filter.icon
            const active = quickFilters.includes(filter.value)
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => onQuickFilterToggle(filter.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                {filter.label}
              </button>
            )
          })}
        </div>

        {hasFilters ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-border/80 pt-3">
            <span className="text-xs font-medium text-muted-foreground">
              Active ({activeFilterCount}):
            </span>

            {hasSearch ? (
              <Badge variant="secondary" className="h-6 gap-1 pr-1.5">
                <span>Search: {search}</span>
                <button
                  type="button"
                  aria-label="Clear search filter"
                  onClick={() => onSearchChange("")}
                  className="rounded-full p-0.5 hover:bg-background/80"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ) : null}

            {hasStatus ? (
              <Badge variant="secondary" className="h-6 gap-1 pr-1.5">
                <span>Status: {statusLabel}</span>
                <button
                  type="button"
                  aria-label="Clear status filter"
                  onClick={() => onStatusChange("all")}
                  className="rounded-full p-0.5 hover:bg-background/80"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ) : null}

            {quickFilters.map((value) => {
              const label =
                quickFilterOptions.find((option) => option.value === value)?.label ?? value
              return (
                <Badge key={value} variant="secondary" className="h-6 gap-1 pr-1.5">
                  <span>{label}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${label} filter`}
                    onClick={() => onQuickFilterToggle(value)}
                    className="rounded-full p-0.5 hover:bg-background/80"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )
            })}

            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-7 px-2 text-muted-foreground"
              onClick={onResetFilters}
            >
              Clear all
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
