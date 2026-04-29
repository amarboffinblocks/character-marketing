"use client"

import { useMemo, useState } from "react"
import { UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

type RequestType = "custom_package" | "preselect_package"
type RequestStatus = "pending" | "processing" | "accepted" | "rejected" | "completed"

type BuyerRequestRow = {
  id: string
  request_type: RequestType
  creator_id: string
  requester_id: string
  package_id: string
  package_title: string
  package_price: number
  tokens_label: string
  status: RequestStatus
  created_at: string
  creator_profile_data: unknown | null
  order_id: string | null
}

const requestStatusLabel: Record<RequestStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  accepted: "Accepted",
  rejected: "Rejected",
  completed: "Completed",
}

const requestStatusClass: Record<RequestStatus, string> = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  processing: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  accepted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rejected: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  completed: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
}

const requestTypeLabel: Record<RequestType, string> = {
  custom_package: "Custom package",
  preselect_package: "Pre-select",
}

const ROWS_PER_PAGE = 12

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatCreatedAt(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
}

function safeCreatorSummary(profileData: unknown) {
  const root = profileData && typeof profileData === "object" ? (profileData as Record<string, unknown>) : null
  const creator =
    root && root.creator && typeof root.creator === "object" ? (root.creator as Record<string, unknown>) : null

  const displayName =
    (creator && typeof creator.displayName === "string" && creator.displayName.trim()) ||
    (creator && typeof creator.name === "string" && creator.name.trim()) ||
    (root && typeof root.displayName === "string" && root.displayName.trim()) ||
    (root && typeof root.name === "string" && root.name.trim()) ||
    "Creator"

  const avatarUrl =
    (creator && typeof creator.avatarUrl === "string" ? creator.avatarUrl.trim() : "") ||
    (root && typeof root.avatarUrl === "string" ? root.avatarUrl.trim() : "")

  return {
    displayName,
    avatarUrl: avatarUrl.length > 0 ? avatarUrl : null,
  }
}

export function RequestsClientTable({ requests }: { requests: BuyerRequestRow[] }) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(requests.length / ROWS_PER_PAGE))
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE
    return requests.slice(start, start + ROWS_PER_PAGE)
  }, [currentPage, requests])

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="py-4">Creator</TableHead>
            <TableHead>Request</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-center">Price</TableHead>
            <TableHead className="text-right">Order</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedRows.map((req) => {
            const creator = safeCreatorSummary(req.creator_profile_data)
            return (
              <TableRow key={req.id} className="hover:bg-muted/10">
                <TableCell className="py-5">
                  <div className="flex items-center gap-3">
                    {creator.avatarUrl ? (
                      <img src={creator.avatarUrl} alt={creator.displayName} className="size-9 rounded-full object-cover shadow-xs" />
                    ) : (
                      <span className="inline-flex size-9 items-center justify-center rounded-full bg-muted/80 text-muted-foreground shadow-xs" aria-hidden>
                        <UserRound className="size-4.5" />
                      </span>
                    )}
                    <span className="text-sm font-semibold tracking-tight text-foreground">{creator.displayName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground">{req.package_title}</span>
                    <span className="text-xs text-muted-foreground">#{req.id.slice(0, 8)}...</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="py-3 px-2 text-xs bg-primary/10">
                    {requestTypeLabel[req.request_type]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("font-medium px-2.5 py-0.5 rounded-md", requestStatusClass[req.status])}>
                    {requestStatusLabel[req.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatCreatedAt(req.created_at)}</TableCell>
                <TableCell className="text-center font-semibold text-foreground">{formatCurrency(req.package_price)}</TableCell>
                <TableCell className="text-right">
                  {req.order_id ? (
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      Created
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not yet</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      {requests.length > ROWS_PER_PAGE ? (
        <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}-{Math.min(currentPage * ROWS_PER_PAGE, requests.length)} of {requests.length}
          </p>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious disabled={currentPage <= 1} onClick={() => setCurrentPage((current) => Math.max(1, current - 1))} />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1
                return (
                  <PaginationItem key={`buyer-requests-page-${page}`}>
                    <PaginationLink isActive={page === currentPage} onClick={() => setCurrentPage(page)}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              <PaginationItem>
                <PaginationNext disabled={currentPage >= totalPages} onClick={() => setCurrentPage((current) => Math.min(totalPages, current + 1))} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </>
  )
}
