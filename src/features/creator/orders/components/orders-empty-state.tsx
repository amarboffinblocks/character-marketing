import { FolderSearch } from "lucide-react"

type OrdersEmptyStateProps = {
  hasActiveFilters: boolean
}

export function OrdersEmptyState({ hasActiveFilters }: OrdersEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span
        className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
        aria-hidden
      >
        <FolderSearch className="size-6" />
      </span>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          {hasActiveFilters ? "No matching orders" : "No orders yet"}
        </h3>
        <p className="max-w-md text-sm text-muted-foreground">
          {hasActiveFilters
            ? "Try adjusting your search or filter settings to surface more orders."
            : "As new buyer commissions are accepted, they will appear here for production tracking."}
        </p>
      </div>
    </div>
  )
}
