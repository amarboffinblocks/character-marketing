"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Activity,
  AlertCircle,
  CalendarClock,
  CircleCheckBig,
  ChevronLeft,
  Eye,
  FolderSearch,
  LoaderCircle,
  MessageSquare,
  MoreVertical,
  PackageCheck,
  UserRound,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { openOrCreateThread } from "@/features/messaging/api"
import type {
  CreatorRequestRow,
  CreatorRequestStatus,
  CreatorRequestType,
} from "@/features/creator/orders/creator-requests"
import { cn } from "@/lib/utils"

type CreatorOrdersViewProps = {
  initialRequests: CreatorRequestRow[]
}

const ORDERS_PER_PAGE = 12

const requestTypeLabel: Record<CreatorRequestType, string> = {
  custom_package: "Custom package",
  preselect_package: "Pre-select",
}

const requestStatusLabel: Record<CreatorRequestStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  accepted: "Accepted",
  rejected: "Rejected",
  completed: "Completed",
}

const requestStatusClass: Record<CreatorRequestStatus, string> = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  processing: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  accepted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rejected: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  completed: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
}

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

function getRequestCategories(request: CreatorRequestRow): string[] {
  return [requestTypeLabel[request.request_type]]
}

function safeBuyerSummary(profileData: unknown) {
  const root = profileData && typeof profileData === "object" ? (profileData as Record<string, unknown>) : null
  const user = root && root.user && typeof root.user === "object" ? (root.user as Record<string, unknown>) : null

  const displayName =
    (user && typeof user.displayName === "string" && user.displayName.trim()) ||
    (user && typeof user.name === "string" && user.name.trim()) ||
    (root && typeof root.displayName === "string" && root.displayName.trim()) ||
    (root && typeof root.name === "string" && root.name.trim()) ||
    ""

  const handle =
    (user && typeof user.handle === "string" ? user.handle.trim() : "") ||
    (root && typeof root.handle === "string" ? root.handle.trim() : "")

  const avatarUrl =
    (user && typeof user.avatarUrl === "string" ? user.avatarUrl.trim() : "") ||
    (root && typeof root.avatarUrl === "string" ? root.avatarUrl.trim() : "")
  const email =
    (user && typeof user.email === "string" ? user.email.trim() : "") ||
    (root && typeof root.email === "string" ? root.email.trim() : "")

  return {
    displayName,
    handle: handle.startsWith("@") || handle.length === 0 ? handle : `@${handle}`,
    avatarUrl: avatarUrl.length > 0 ? avatarUrl : null,
    email,
  }
}

function RequestPayloadDetails({ request }: { request: CreatorRequestRow }) {
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
                            if (
                              ["characterName", "personaName", "lorebookName", "backgroundName", "avatarName"].includes(
                                k
                              )
                            ) {
                              return null
                            }

                            const label = k
                              .replace(/([A-Z])/g, " $1")
                              .trim()
                              .replace(/^message To Creator$/, "Note for Creator")
                              .replace(/^scenario Location Universe$/, "Scenario / Location / Universe")
                              .replace(/^estimated Keyword Count$/, "Estimated Keyword Count")
                              .replace(/^personality Summary$/, "Personality Summary")
                              .replace(/^first Message$/, "First Message")
                              .replace(/^alternative First Messages$/, "Alternative First Messages")
                              .replace(/^example Dialogue Style$/, "Dialogue Style")

                            return (
                              <div
                                key={k}
                                className="not-first:border-border/20 sm:col-span-2 not-first:border-t pt-2 first:pt-0"
                              >
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

export function CreatorOrdersView({ initialRequests }: CreatorOrdersViewProps) {
  const router = useRouter()
  const [requests, setRequests] = useState(initialRequests)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<CreatorRequestStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<CreatorRequestType | "all">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRequest, setSelectedRequest] = useState<CreatorRequestRow | null>(null)
  const [updatingAction, setUpdatingAction] = useState<{
    requestId: string
    status: "accepted" | "rejected"
  } | null>(null)
  const [openingChatRequestId, setOpeningChatRequestId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase()
    return requests.filter((request) => {
      const buyer = safeBuyerSummary(request.requester_profile_data)
      const matchesSearch =
        query.length === 0 ||
        request.id.toLowerCase().includes(query) ||
        request.package_title.toLowerCase().includes(query) ||
        buyer.displayName.toLowerCase().includes(query) ||
        buyer.handle.toLowerCase().includes(query)
      const matchesStatus = status === "all" ? true : request.status === status
      const matchesType = typeFilter === "all" ? true : request.request_type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [requests, search, status, typeFilter])
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / ORDERS_PER_PAGE))
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * ORDERS_PER_PAGE
    return filteredRequests.slice(start, start + ORDERS_PER_PAGE)
  }, [currentPage, filteredRequests])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, status, typeFilter])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const hasActiveFilters =
    search.trim().length > 0 || status !== "all" || typeFilter !== "all"

  function resetFilters() {
    setSearch("")
    setStatus("all")
    setTypeFilter("all")
  }

  async function updateStatus(requestId: string, nextStatus: "accepted" | "rejected") {
    setUpdatingAction({ requestId, status: nextStatus })
    setError("")
    try {
      const response = await fetch(`/api/creator/orders/${encodeURIComponent(requestId)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      const json = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(json.error || "Unable to update request status.")
      }
      if (nextStatus === "accepted") {
        // Move accepted item out of requests queue; it appears under creator orders route.
        setRequests((current) => current.filter((item) => item.id !== requestId))
        setSelectedRequest((current) => (current && current.id === requestId ? null : current))
      } else {
        setRequests((current) =>
          current.map((item) => (item.id === requestId ? { ...item, status: nextStatus } : item))
        )
        setSelectedRequest((current) =>
          current && current.id === requestId ? { ...current, status: nextStatus } : current
        )
      }
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update request status.")
    } finally {
      setUpdatingAction(null)
    }
  }

  async function handleOpenBuyerChat(request: CreatorRequestRow, buyerName: string) {
    setOpeningChatRequestId(request.id)
    setError("")
    try {
      const thread = await openOrCreateThread({
        orderId: request.id,
        otherUserId: request.requester_id,
        otherUserName: buyerName || "Buyer",
      })
      const search = new URLSearchParams({
        thread: thread.id,
        order: request.id,
      })
      router.push(`/dashboard/creator/inbox?${search.toString()}`)
    } catch (chatError) {
      setError(chatError instanceof Error ? chatError.message : "Unable to open buyer chat.")
    } finally {
      setOpeningChatRequestId(null)
    }
  }

  const totalRequests = requests.length
  const pendingRequests = requests.filter((request) => request.status === "pending").length
  const activeRequests = requests.filter(
    (request) => request.status === "processing" || request.status === "accepted"
  ).length
  const summaryCards = [
    {
      key: "total",
      title: "Total requests",
      value: totalRequests,
      note: "All incoming buyer requests",
      icon: Activity,
      accent: "text-violet-600",
      ring: "ring-violet-500/20",
      bg: "from-violet-500/10 via-violet-500/5 to-transparent",
    },
    {
      key: "pending",
      title: "Pending review",
      value: pendingRequests,
      note: "Need accept or reject action",
      icon: AlertCircle,
      accent: "text-amber-600",
      ring: "ring-amber-500/20",
      bg: "from-amber-500/10 via-amber-500/5 to-transparent",
    },
    {
      key: "active",
      title: "Active work",
      value: activeRequests,
      note: "Accepted or processing now",
      icon: PackageCheck,
      accent: "text-emerald-600",
      ring: "ring-emerald-500/20",
      bg: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    },
  ] as const

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pt-6 pb-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Creator Requests</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Review incoming buyer requests, accept or reject pending items, and create orders on acceptance.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/dashboard/creator/inbox" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-9")}>
              <CalendarClock className="size-4" />
              Open inbox
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card
              key={card.key}
              className={cn(
                "relative overflow-hidden rounded-2xl border-border/70 bg-card p-4 shadow-sm",
                "bg-linear-to-br",
                card.bg
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{card.value}</p>
                </div>
                <span
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-lg bg-background/80 ring-1 shadow-xs",
                    card.ring
                  )}
                >
                  <Icon className={cn("size-4.5", card.accent)} />
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{card.note}</p>
            </Card>
          )
        })}
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1.8fr_1fr_1fr_auto]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by buyer, request ID, or package"
          />
          <Select value={status} onValueChange={(value) => setStatus(value as CreatorRequestStatus | "all")}>
            <SelectTrigger aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as CreatorRequestType | "all")}>
            <SelectTrigger aria-label="Filter by request type">
              <SelectValue placeholder="Request type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All request types</SelectItem>
              <SelectItem value="custom_package">Custom package</SelectItem>
              <SelectItem value="preselect_package">Pre-select package</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" onClick={resetFilters} disabled={!hasActiveFilters}>
            Reset
          </Button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card shadow-sm">
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
              <FolderSearch className="size-6" />
            </span>
            <h2 className="text-base font-semibold text-foreground">
              {hasActiveFilters ? "No matching requests" : "No creator requests yet"}
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              {hasActiveFilters
                ? "Try clearing one or more filters to see additional requests."
                : "Incoming buyer requests for your packages will show here."}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[980px] table-fixed">
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-[21%]">Buyer</TableHead>
                <TableHead className="w-[21%]">Request</TableHead>
                <TableHead className="w-[14%]">Categories</TableHead>
                <TableHead className="w-[14%]">Status</TableHead>
                <TableHead className="w-[14%]">Created</TableHead>
                <TableHead className="w-[8%] text-center">Price</TableHead>
                <TableHead className="w-[8%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRequests.map((request) => {
                const buyer = safeBuyerSummary(request.requester_profile_data)
                const buyerName = buyer.displayName || "Buyer"
                const isAcceptUpdating =
                  updatingAction?.requestId === request.id && updatingAction.status === "accepted"
                const isRejectUpdating =
                  updatingAction?.requestId === request.id && updatingAction.status === "rejected"
                const isAcceptDisabled =
                  request.status === "accepted" || request.status === "processing" || request.status === "completed" || isAcceptUpdating
                const isRejectDisabled =
                  request.status === "rejected" || request.status === "processing" || request.status === "completed" || isRejectUpdating
                const isOpeningChat = openingChatRequestId === request.id
                const categories = getRequestCategories(request)
                return (
                  <TableRow key={request.id}>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2.5">
                        {buyer.avatarUrl ? (
                          <Image
                            src={buyer.avatarUrl}
                            alt={buyerName}
                            width={36}
                            height={36}
                            className="size-9 rounded-full object-cover shadow-xs"
                          />
                        ) : (
                          <span className="inline-flex size-9 items-center justify-center rounded-full bg-muted/80 text-muted-foreground shadow-xs" aria-hidden>
                            <UserRound className="size-4.5" />
                          </span>
                        )}
                        <div className="flex flex-col gap-0">
                          <span className="text-sm font-semibold tracking-tight text-foreground">{buyerName}</span>
                          <span className="text-xs text-muted-foreground/85">
                            {buyer.email || buyer.handle || "—"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-0">
                        <span className="font-medium text-foreground">{request.package_title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {categories.slice(0, 3).map((category) => (
                            <Badge key={`${request.id}-${category}`} variant="outline" className="py-3  px-2 bg-primary/10 text-xs">
                              {category}
                            </Badge>
                          ))}
                          {categories.length > 3 ? (
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                              +{categories.length - 3}
                            </Badge>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn("font-medium px-2.5 py-0.5 rounded-md", requestStatusClass[request.status])}>
                        {requestStatusLabel[request.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">{formatCreatedAt(request.created_at)}</TableCell>
                    <TableCell className="py-4 text-center font-semibold text-foreground">{formatCurrency(request.package_price)}</TableCell>
                    <TableCell className="py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" aria-label="Open actions menu">
                              <MoreVertical className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => setSelectedRequest(request)}>
                            <Eye className="size-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-emerald-700 font-semibold focus:bg-emerald-100 focus:text-emerald-800 dark:focus:bg-emerald-500/20 dark:focus:text-emerald-300"
                            disabled={isAcceptDisabled}
                            onClick={() => void updateStatus(request.id, "accepted")}
                          >
                            {isAcceptUpdating ? <LoaderCircle className="size-4 animate-spin" /> : <CircleCheckBig className="size-4" />}
                            Accept
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-rose-700 font-semibold focus:bg-rose-100 focus:text-rose-800 dark:focus:bg-rose-500/20 dark:focus:text-rose-300"
                            disabled={isRejectDisabled}
                            onClick={() => void updateStatus(request.id, "rejected")}
                          >
                            {isRejectUpdating ? <LoaderCircle className="size-4 animate-spin" /> : <X className="size-4" />}
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={isOpeningChat}
                            onClick={() => void handleOpenBuyerChat(request, buyerName)}
                          >
                            {isOpeningChat ? <LoaderCircle className="size-4 animate-spin" /> : <MessageSquare className="size-4" />}
                            Chat with buyer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
            </Table>
          </div>
        )}
      </section>
      {filteredRequests.length > ORDERS_PER_PAGE ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * ORDERS_PER_PAGE + 1}-
            {Math.min(currentPage * ORDERS_PER_PAGE, filteredRequests.length)} of{" "}
            {filteredRequests.length}
          </p>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1
                return (
                  <PaginationItem key={`creator-orders-page-${page}`}>
                    <PaginationLink isActive={page === currentPage} onClick={() => setCurrentPage(page)}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              <PaginationItem>
                <PaginationNext
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((current) => Math.min(totalPages, current + 1))}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

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
    </main>
  )
}
