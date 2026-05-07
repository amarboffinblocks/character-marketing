import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrdersDataTable } from "@/features/creator/orders/components/orders-data-table"
import { OrdersEmptyState } from "@/features/creator/orders/components/orders-empty-state"
import { OrdersMobileList } from "@/features/creator/orders/components/orders-mobile-list"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { CreatorOrder } from "@/features/creator/orders/types"

type OrdersListCardProps = {
  orders: CreatorOrder[]
  title: string
  description: string
  hasActiveFilters?: boolean
  context?: "creator" | "admin"
}

export function OrdersListCard({
  orders,
  title,
  description,
  hasActiveFilters = false,
  context = "creator",
}: OrdersListCardProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [orders.length])

  const hasOrders = orders.length > 0
  const totalPages = Math.ceil(orders.length / itemsPerPage)
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {hasOrders ? (
          <>
            <div className="hidden md:block">
              <OrdersDataTable orders={paginatedOrders} context={context} />
            </div>
            <OrdersMobileList orders={paginatedOrders} context={context} />

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border/50 px-4 py-3 sm:px-6">
                <div className="flex flex-1 items-center justify-between gap-4">
                  <p className="text-xs text-muted-foreground">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, orders.length)}
                    </span>{" "}
                    of <span className="font-medium">{orders.length}</span> orders
                  </p>
                  <Pagination className="mx-0 w-auto justify-end">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          disabled={currentPage <= 1}
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          disabled={currentPage >= totalPages}
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}
          </>
        ) : (
          <OrdersEmptyState hasActiveFilters={hasActiveFilters} />
        )}
      </CardContent>
    </Card>
  )
}
