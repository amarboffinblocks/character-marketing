"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, Eye, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  request_payload: unknown
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
  const [selectedRequest, setSelectedRequest] = useState<BuyerRequestRow | null>(null)
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
            <TableHead className="text-right">Actions</TableHead>
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
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    aria-label={`Preview request ${req.id}`}
                    title="Preview request"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <Eye className="size-3.5" />
                  </Button>
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

      <Dialog open={Boolean(selectedRequest)} onOpenChange={(open) => (open ? undefined : setSelectedRequest(null))}>
        <DialogContent className="sm:max-w-2xl">
          {selectedRequest ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRequest.package_title}</DialogTitle>
                <DialogDescription>
                  Request #{selectedRequest.id} · {requestTypeLabel[selectedRequest.request_type]}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border/60 bg-muted/15 p-3">
                    <p className="text-xs font-semibold text-muted-foreground">Status</p>
                    <p className="mt-1 font-medium text-foreground">{requestStatusLabel[selectedRequest.status]}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/15 p-3">
                    <p className="text-xs font-semibold text-muted-foreground">Price</p>
                    <p className="mt-1 font-medium text-foreground">{formatCurrency(selectedRequest.package_price)}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/15 p-3">
                  <p className="text-xs font-semibold text-muted-foreground">Tokens</p>
                  <p className="mt-1 font-medium text-foreground">{selectedRequest.tokens_label || "—"}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/15 p-3">
                  <p className="text-xs font-semibold text-muted-foreground">Request Details</p>
                  <RequestPayloadDetails request={selectedRequest} />
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

function RequestPayloadDetails({ request }: { request: BuyerRequestRow }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  let payload = request.request_payload
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload)
    } catch {
      payload = undefined
    }
  }

  const parsedPayload = payload as Record<string, unknown> | undefined
  if (!parsedPayload) return null

  const details =
    parsedPayload.details && typeof parsedPayload.details === "object"
      ? (parsedPayload.details as Record<string, unknown>)
      : {}
  const notes =
    (typeof parsedPayload.notes === "string" && parsedPayload.notes) ||
    (typeof parsedPayload.instructions === "string" && parsedPayload.instructions) ||
    (typeof parsedPayload.messageToCreator === "string" && parsedPayload.messageToCreator) ||
    ""

  if (request.request_type === "custom_package") {
    const keys = ["character", "persona", "lorebook", "background", "avatar"] as const

    return (
      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Requested Assets</h4>
          {!activeCategory ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {keys.map((key) => {
                const items = Array.isArray(details[key]) ? details[key] : []
                if (items.length === 0) return null

                const firstNames = items
                  .map((item) =>
                    typeof item === "string"
                      ? item
                      : (item as Record<string, unknown>)?.characterName ||
                        (item as Record<string, unknown>)?.personaName ||
                        (item as Record<string, unknown>)?.lorebookName ||
                        (item as Record<string, unknown>)?.backgroundName ||
                        (item as Record<string, unknown>)?.avatarName ||
                        `Custom ${key}`
                  )
                  .slice(0, 2)
                  .join(", ")

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveCategory(key)}
                    className="flex w-full cursor-pointer flex-col items-start rounded-xl border border-border/60 bg-muted/20 p-4 text-left shadow-2xs transition-all duration-200 hover:bg-muted/40"
                  >
                    <p className="text-xs font-semibold capitalize text-muted-foreground">
                      {key}s ({items.length})
                    </p>
                    <p className="mt-1.5 w-full truncate text-sm font-medium text-foreground/90">
                      {firstNames}
                      {items.length > 2 ? "..." : ""}
                    </p>
                    <span className="mt-2 text-[10px] font-medium text-primary/80">Click to view details</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <h4 className="flex items-center gap-1 text-sm font-bold capitalize text-foreground">
                  <span className="text-primary">{activeCategory}s</span> Details
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 cursor-pointer px-2 text-xs hover:bg-primary/10 hover:text-primary"
                  onClick={() => setActiveCategory(null)}
                >
                  <ChevronLeft className="mr-1 size-3.5" />
                  Back
                </Button>
              </div>

              <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1 pt-1">
                {Array.isArray(details[activeCategory]) &&
                  (details[activeCategory] as unknown[]).map((item, idx) => {
                    const itemObject =
                      item && typeof item === "object" ? (item as Record<string, unknown>) : {}
                    const name =
                      typeof item === "string"
                        ? item
                        : itemObject.characterName ||
                          itemObject.personaName ||
                          itemObject.lorebookName ||
                          itemObject.backgroundName ||
                          itemObject.avatarName ||
                          `Custom ${activeCategory} #${idx + 1}`

                    return (
                      <div
                        key={`${activeCategory}-${idx}`}
                        className="space-y-3 rounded-xl border border-border bg-background/50 p-4 shadow-2xs"
                      >
                        <p className="border-b border-border/40 pb-1.5 text-sm font-semibold text-primary">
                          {String(name)}
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {Object.entries(itemObject).map(([k, v]) => {
                            if (!v || k === "id") return null
                            if (["characterName", "personaName", "lorebookName", "backgroundName", "avatarName"].includes(k)) {
                              return null
                            }
                            const label = k.replace(/([A-Z])/g, " $1").trim()
                            return (
                              <div key={k} className="not-first:border-border/20 sm:col-span-2 not-first:border-t pt-2 first:pt-0">
                                <span className="mb-1 block text-xs font-semibold capitalize text-foreground/95">
                                  {label}
                                </span>
                                <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground/85">
                                  {String(v)}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </div>

        {notes ? (
          <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/10 p-3">
            <h4 className="text-xs font-semibold text-muted-foreground">Instructions</h4>
            <p className="whitespace-pre-wrap text-sm text-foreground">{notes}</p>
          </div>
        ) : null}
      </div>
    )
  }

  if (request.request_type === "preselect_package") {
    const requestedAssets =
      parsedPayload.requestedAssets && typeof parsedPayload.requestedAssets === "object"
        ? (parsedPayload.requestedAssets as Record<string, unknown>)
        : {}
    const keys = ["character", "persona", "lorebook", "background", "avatar"] as const

    return (
      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Included Assets</h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {keys.map((key) => {
              const count = typeof requestedAssets[key] === "number" ? requestedAssets[key] : 0
              if (count === 0) return null
              return (
                <div key={key} className="rounded-lg border border-border/60 bg-muted/20 p-2 text-center">
                  <p className="text-lg font-semibold text-foreground">{count}</p>
                  <p className="text-xs capitalize text-muted-foreground">{key}s</p>
                </div>
              )
            })}
          </div>
        </div>

        {notes ? (
          <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/10 p-3">
            <h4 className="text-xs font-semibold text-muted-foreground">Instructions</h4>
            <p className="whitespace-pre-wrap text-sm text-foreground">{notes}</p>
          </div>
        ) : null}
      </div>
    )
  }

  return null
}
