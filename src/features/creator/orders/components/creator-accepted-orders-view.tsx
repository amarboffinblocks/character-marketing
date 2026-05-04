"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Activity,
  CheckCircle2,
  CreditCard,
  Copy,
  Eye,
  ExternalLink,
  LoaderCircle,
  MoreVertical,
  NotebookPen,
  PackageCheck,
  Timer,
  UserRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { CreatorOrderRow, CreatorOrderStatus, CreatorPaymentStatus } from "@/features/creator/orders/creator-orders"
import { buyerSummaryFromProfileData } from "@/lib/profile-buyer-display"
import { cn } from "@/lib/utils"

/** Values sent to PATCH /api/creator/orders/[id]/order-status */
type OrderStatusPatch = "pending" | "processing" | "on_hold" | "reviewing" | "delivered" | "completed"

function patchApiStatusToRowStatus(api: OrderStatusPatch): CreatorOrderStatus {
  switch (api) {
    case "pending":
      return "pending_payment"
    case "processing":
      return "in_progress"
    case "on_hold":
      return "on_hold"
    case "reviewing":
      return "reviewing"
    case "delivered":
      return "delivered"
    case "completed":
      return "completed"
    default:
      return "in_progress"
  }
}

const REVIEW_REQUIRED_TYPES = ["character", "persona", "lorebook", "avatar"] as const

type ReviewPickKey = (typeof REVIEW_REQUIRED_TYPES)[number] | "background"

type CreatorPayoutProfile = {
  stripeConnectAccountId: string
  payoutAccountHolderName: string
  payoutCountry: string
  payoutCurrency: string
}

/** Initial / cleared state for per-type asset dropdowns */
const EMPTY_ASSET_PICKS: Record<ReviewPickKey, string> = {
  character: "",
  persona: "",
  lorebook: "",
  avatar: "",
  background: "",
}

/** Options API returns keyed rows; map to picker keys used in payloads. */
const REVIEW_ROWS: ReadonlyArray<{ pickKey: ReviewPickKey; optionsKey: string; label: string; required: boolean }> = [
  { pickKey: "character", optionsKey: "character", label: "Character", required: false },
  { pickKey: "persona", optionsKey: "persona", label: "Persona", required: false },
  { pickKey: "lorebook", optionsKey: "lorebook", label: "Lorebook", required: false },
  { pickKey: "avatar", optionsKey: "avatar", label: "Avatar", required: false },
  { pickKey: "background", optionsKey: "background", label: "Background", required: false },
]

const DELIVERY_PICK_ROWS: ReadonlyArray<{ pickKey: ReviewPickKey; optionsKey: string; label: string }> = [
  { pickKey: "character", optionsKey: "character", label: "Character" },
  { pickKey: "persona", optionsKey: "persona", label: "Persona" },
  { pickKey: "lorebook", optionsKey: "lorebook", label: "Lorebook" },
  { pickKey: "avatar", optionsKey: "avatar", label: "Avatar" },
  { pickKey: "background", optionsKey: "background", label: "Background" },
]

function picksToDeliverableAssets(picks: Record<ReviewPickKey, string>): Array<{ assetType: string; assetId: string }> {
  const out: Array<{ assetType: string; assetId: string }> = []
  for (const t of REVIEW_REQUIRED_TYPES) {
    const id = picks[t]?.trim()
    if (id) out.push({ assetType: t, assetId: id })
  }
  const bg = picks.background?.trim()
  if (bg) out.push({ assetType: "background", assetId: bg })
  return out
}

function picksToReviewAssets(picks: Record<ReviewPickKey, string>): Array<{ assetType: string; assetId: string }> {
  return picksToDeliverableAssets(picks)
}

function selectedOptionLabel(
  items: Array<{ assetId: string; title: string; subtitle: string }>,
  assetId: string,
  fallback: string
) {
  const selected = items.find((item) => item.assetId === assetId)
  if (!selected) return fallback
  return selected.subtitle ? `${selected.title} · ${selected.subtitle}` : selected.title
}

function creatorWorkspacePreviewHref(assetType: ReviewPickKey, assetId: string) {
  if (!assetId) return ""
  if (assetType === "character") return `/dashboard/creator/workspace/characters/view?id=${encodeURIComponent(assetId)}`
  if (assetType === "persona") return `/dashboard/creator/workspace/personas/view?id=${encodeURIComponent(assetId)}`
  if (assetType === "lorebook") return `/dashboard/creator/workspace/lorebooks/view?id=${encodeURIComponent(assetId)}`
  if (assetType === "avatar") return `/dashboard/creator/workspace/avatars/view?id=${encodeURIComponent(assetId)}`
  return `/dashboard/creator/workspace/backgrounds/view?id=${encodeURIComponent(assetId)}`
}

async function copyAssetSelection(assetType: ReviewPickKey, assetId: string) {
  if (!assetId || typeof navigator === "undefined" || !navigator.clipboard) return
  await navigator.clipboard.writeText(`${assetType}:${assetId}`)
}

const orderStatusLabel: Record<CreatorOrderStatus, string> = {
  pending: "Awaiting start",
  pending_payment: "Pending",
  funded: "Funded",
  in_progress: "Processing",
  on_hold: "On hold",
  reviewing: "Under review",
  delivered: "Delivered",
  approved: "Approved",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
}

const orderStatusClass: Record<CreatorOrderStatus, string> = {
  pending: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
  pending_payment: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  funded: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  in_progress: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  on_hold: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  reviewing: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
  delivered: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  approved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  completed: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  cancelled: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  refunded: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
}

const paymentStatusLabel: Record<CreatorPaymentStatus, string> = {
  unpaid: "Unpaid",
  pending: "In escrow",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatCreatedAt(value: string | Date) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
}

function safeBuyerSummary(profileData: unknown) {
  const b = buyerSummaryFromProfileData(profileData)
  return {
    displayName: b.displayName || "Buyer",
    avatarUrl: b.avatarUrl,
  }
}

function OrderSnapshotDetails({ order }: { order: CreatorOrderRow }) {
  let payload = order.request_snapshot
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload)
    } catch {
      payload = undefined
    }
  }
  const parsedPayload = payload as Record<string, unknown> | undefined
  if (!parsedPayload) return null
  const requestTypeRaw =
    (typeof parsedPayload.requestType === "string" && parsedPayload.requestType) ||
    (typeof parsedPayload.source === "string" ? parsedPayload.source : "")
  const requestPayload =
    parsedPayload.requestPayload && typeof parsedPayload.requestPayload === "object"
      ? (parsedPayload.requestPayload as Record<string, unknown>)
      : {}
  const notes =
    (typeof requestPayload.notes === "string" && requestPayload.notes) ||
    (typeof requestPayload.instructions === "string" && requestPayload.instructions) ||
    (typeof requestPayload.messageToCreator === "string" && requestPayload.messageToCreator) ||
    ""
  const acceptedAt =
    typeof parsedPayload.acceptedAt === "string" ? new Date(parsedPayload.acceptedAt) : null

  const revisionMessage = typeof parsedPayload.revision_message === "string" ? parsedPayload.revision_message : ""

  const requestedAssets =
    requestPayload.requestedAssets && typeof requestPayload.requestedAssets === "object"
      ? (requestPayload.requestedAssets as Record<string, unknown>)
      : {}
  const assetKeys = ["character", "persona", "lorebook", "background", "avatar"] as const
  const hasAssetCounts = assetKeys.some((key) => typeof requestedAssets[key] === "number" && Number(requestedAssets[key]) > 0)

  const detailEntries = Object.entries(requestPayload).filter(([key, value]) => {
    if (value === null || value === undefined || value === "") return false
    if (key === "requestedAssets" || key === "notes" || key === "instructions" || key === "messageToCreator") return false
    return true
  })

  return (
    <div className="space-y-3 text-sm">
      {revisionMessage && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-900/30 dark:bg-rose-900/10">
          <p className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Revision requested</p>
          <p className="mt-1 font-medium text-foreground">{revisionMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border/60 bg-muted/15 p-3">
          <p className="text-xs font-semibold text-muted-foreground">Request type</p>
          <p className="mt-1 font-medium text-foreground">
            {requestTypeRaw === "preselect_package"
              ? "Pre-select package"
              : requestTypeRaw === "custom_package"
                ? "Custom package"
                : requestTypeRaw || "—"}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-muted/15 p-3">
          <p className="text-xs font-semibold text-muted-foreground">Accepted on</p>
          <p className="mt-1 font-medium text-foreground">
            {acceptedAt && !Number.isNaN(acceptedAt.getTime())
              ? acceptedAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
              : "—"}
          </p>
        </div>
      </div>

      {hasAssetCounts ? (
        <div className="rounded-lg border border-border/60 bg-muted/15 p-3">
          <p className="text-xs font-semibold text-muted-foreground">Included assets</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {assetKeys.map((key) => {
              const count = typeof requestedAssets[key] === "number" ? Number(requestedAssets[key]) : 0
              if (count <= 0) return null
              return (
                <div key={key} className="rounded-md border border-border/50 bg-background/70 px-2 py-1.5 text-center">
                  <p className="text-sm font-semibold text-foreground">{count}</p>
                  <p className="text-[11px] capitalize text-muted-foreground">{key}s</p>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {detailEntries.length > 0 ? (
        <div className="rounded-lg border border-border/60 bg-muted/15 p-3">
          <p className="text-xs font-semibold text-muted-foreground">Request details</p>
          <div className="mt-2 space-y-2">
            {detailEntries.map(([key, value]) => (
              <div key={key}>
                <p className="text-[11px] font-semibold text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <p className="whitespace-pre-wrap text-sm text-foreground">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {notes ? (
        <div className="rounded-lg border border-border/60 bg-muted/15 p-3">
          <p className="text-xs font-semibold text-muted-foreground">Initial instructions</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{notes}</p>
        </div>
      ) : null}
    </div>
  )
}

export function CreatorAcceptedOrdersView({ initialOrders }: { initialOrders: CreatorOrderRow[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<CreatorOrderRow | null>(null)
  const [orderToView, setOrderToView] = useState<CreatorOrderRow | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [nextStatus, setNextStatus] = useState<OrderStatusPatch>("processing")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [deliveryOrder, setDeliveryOrder] = useState<CreatorOrderRow | null>(null)
  const [deliveryOptions, setDeliveryOptions] = useState<Record<string, Array<{ assetType: string; assetId: string; title: string; subtitle: string; thumbnailUrl: string | null }>>>({})
  const [deliveryPick, setDeliveryPick] = useState<Record<ReviewPickKey, string>>(EMPTY_ASSET_PICKS)
  const [deliveryNote, setDeliveryNote] = useState("")
  const [isLoadingDeliveryOptions, setIsLoadingDeliveryOptions] = useState(false)
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false)
  const [statusReviewOptions, setStatusReviewOptions] = useState<
    Record<string, Array<{ assetType: string; assetId: string; title: string; subtitle: string; thumbnailUrl: string | null }>>
  >({})
  const [statusReviewPick, setStatusReviewPick] = useState<Record<ReviewPickKey, string>>(EMPTY_ASSET_PICKS)
  const [statusReviewNote, setStatusReviewNote] = useState("")
  const [isLoadingStatusReviewOptions, setIsLoadingStatusReviewOptions] = useState(false)
  const [error, setError] = useState("")
  const [creatorPayoutProfile, setCreatorPayoutProfile] = useState<CreatorPayoutProfile | null>(null)
  const [isLoadingPayoutProfile, setIsLoadingPayoutProfile] = useState(false)

  function toStatusOption(status: CreatorOrderStatus): OrderStatusPatch {
    switch (status) {
      case "pending_payment":
      case "pending":
        return "pending"
      case "funded":
      case "in_progress":
        return "processing"
      case "delivered":
        return "delivered"
      case "completed":
        return "delivered"
      case "reviewing":
        return "reviewing"
      case "on_hold":
      case "approved":
        return "reviewing"
      default:
        return "processing"
    }
  }

  function openStatusModal(order: CreatorOrderRow) {
    setSelectedOrder(order)
    setNextStatus(toStatusOption(order.status))
    setStatusReviewPick({ ...EMPTY_ASSET_PICKS })
    setStatusReviewNote("")
    setStatusReviewOptions({})
    setError("")
  }

  function openViewModal(order: CreatorOrderRow) {
    setOrderToView(order)
    setIsViewDialogOpen(true)
  }

  function openDeliveryDialog(order: CreatorOrderRow) {
    setDeliveryOrder(order)
    setDeliveryOptions({})
    setDeliveryPick({ ...EMPTY_ASSET_PICKS })
    setDeliveryNote("")
    setError("")
  }

  const deliveredAssetCount = useMemo(() => picksToDeliverableAssets(deliveryPick).length, [deliveryPick])

  useEffect(() => {
    if (!deliveryOrder) return
    let mounted = true
    setIsLoadingDeliveryOptions(true)
    setError("")
    void (async () => {
      try {
        const response = await fetch(`/api/creator/orders/${encodeURIComponent(deliveryOrder.id)}/deliverables`)
        const json = (await response.json()) as {
          error?: string
          options?: Record<string, Array<{ assetType: string; assetId: string; title: string; subtitle: string; thumbnailUrl: string | null }>>
        }
        if (!response.ok) {
          throw new Error(json.error || "Unable to load deliverable options.")
        }
        if (!mounted) return
        setDeliveryOptions(json.options ?? {})
      } catch (deliveryError) {
        if (!mounted) return
        setError(deliveryError instanceof Error ? deliveryError.message : "Unable to load deliverable options.")
      } finally {
        if (mounted) setIsLoadingDeliveryOptions(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [deliveryOrder])

  useEffect(() => {
    if (!deliveryOrder) return
    let mounted = true
    setIsLoadingPayoutProfile(true)
    void (async () => {
      try {
        const response = await fetch("/api/profile/me?role=creator")
        const json = (await response.json()) as { data?: Record<string, unknown> }
        if (!response.ok || !mounted) return
        const data = json.data ?? {}
        setCreatorPayoutProfile({
          stripeConnectAccountId:
            typeof data.stripeConnectAccountId === "string" ? data.stripeConnectAccountId : "",
          payoutAccountHolderName:
            typeof data.payoutAccountHolderName === "string" ? data.payoutAccountHolderName : "",
          payoutCountry: typeof data.payoutCountry === "string" ? data.payoutCountry : "",
          payoutCurrency: typeof data.payoutCurrency === "string" ? data.payoutCurrency : "",
        })
      } finally {
        if (mounted) setIsLoadingPayoutProfile(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [deliveryOrder])

  useEffect(() => {
    if (!selectedOrder || nextStatus !== "reviewing") return
    let mounted = true
    setIsLoadingStatusReviewOptions(true)
    setError("")
    void (async () => {
      try {
        const response = await fetch(`/api/creator/orders/${encodeURIComponent(selectedOrder.id)}/deliverables`)
        const json = (await response.json()) as {
          error?: string
          options?: Record<
            string,
            Array<{ assetType: string; assetId: string; title: string; subtitle: string; thumbnailUrl: string | null }>
          >
        }
        if (!response.ok) {
          throw new Error(json.error || "Unable to load workspace assets.")
        }
        if (!mounted) return
        setStatusReviewOptions(json.options ?? {})
      } catch (loadError) {
        if (!mounted) return
        setError(loadError instanceof Error ? loadError.message : "Unable to load workspace assets.")
      } finally {
        if (mounted) setIsLoadingStatusReviewOptions(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [selectedOrder, nextStatus])

  async function confirmStatusUpdate() {
    if (!selectedOrder) return
    const reviewAssets = picksToReviewAssets(statusReviewPick)
    setIsUpdatingStatus(true)
    setError("")
    try {
      const body =
        nextStatus === "reviewing"
          ? { status: "reviewing" as const, assets: reviewAssets, deliveryNote: statusReviewNote }
          : { status: nextStatus }
      const response = await fetch(`/api/creator/orders/${encodeURIComponent(selectedOrder.id)}/order-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = (await response.json()) as {
        error?: string
        order?: {
          id: string
          status?: OrderStatusPatch
          paymentStatus?: CreatorPaymentStatus
        }
      }
      if (!response.ok) {
        throw new Error(json.error || "Unable to update order status.")
      }
      const resolvedPatch: OrderStatusPatch = json.order?.status ?? nextStatus
      const nextLocalStatus = patchApiStatusToRowStatus(resolvedPatch)
      setOrders((current) =>
        current.map((order) =>
          order.id === selectedOrder.id
            ? {
              ...order,
              status: nextLocalStatus,
              payment_status: json.order?.paymentStatus ?? order.payment_status,
            }
            : order
        )
      )
      setSelectedOrder(null)
      setStatusReviewPick({ ...EMPTY_ASSET_PICKS })
      setStatusReviewNote("")
      setStatusReviewOptions({})
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update order status.")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  async function submitDelivery() {
    if (!deliveryOrder) return
    const assets = picksToDeliverableAssets(deliveryPick)
    if (assets.length === 0) {
      setError("Select at least one asset to deliver (use any dropdown). You can leave the others empty.")
      return
    }
    setIsSubmittingDelivery(true)
    setError("")
    try {
      const response = await fetch(`/api/creator/orders/${encodeURIComponent(deliveryOrder.id)}/deliverables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryNote,
          assets,
        }),
      })
      const json = (await response.json()) as {
        error?: string
        order?: {
          id?: string
          status?: CreatorOrderStatus
          paymentStatus?: CreatorPaymentStatus
        }
      }
      if (!response.ok) {
        throw new Error(json.error || "Unable to submit delivery.")
      }
      setOrders((current) =>
        current.map((order) =>
          order.id === deliveryOrder.id
            ? {
                ...order,
                status: json.order?.status ?? "delivered",
                payment_status: json.order?.paymentStatus ?? order.payment_status,
              }
            : order
        )
      )
      setDeliveryOrder(null)
      setDeliveryPick({ ...EMPTY_ASSET_PICKS })
      setDeliveryNote("")
    } catch (deliveryError) {
      setError(deliveryError instanceof Error ? deliveryError.message : "Unable to submit delivery.")
    } finally {
      setIsSubmittingDelivery(false)
    }
  }

  const openCount = useMemo(
    () =>
      orders.filter((o) =>
        ["pending_payment", "funded", "in_progress", "delivered", "approved", "reviewing", "on_hold"].includes(
          o.status
        )
      ).length,
    [orders]
  )

  const completedCount = useMemo(
    () => orders.filter((o) => o.status === "completed").length,
    [orders]
  )
  const missingPayoutFields = useMemo(() => {
    if (!creatorPayoutProfile) return ["Stripe account ID"]
    const missing: string[] = []
    if (!creatorPayoutProfile.stripeConnectAccountId.trim()) missing.push("Stripe account ID")
    if (!creatorPayoutProfile.payoutAccountHolderName.trim()) missing.push("Account holder name")
    if (!creatorPayoutProfile.payoutCountry.trim()) missing.push("Payout country")
    if (!creatorPayoutProfile.payoutCurrency.trim()) missing.push("Payout currency")
    return missing
  }, [creatorPayoutProfile])
  const payoutReady = missingPayoutFields.length === 0
  const summaryCards = [
    {
      key: "total",
      title: "Total orders",
      value: orders.length,
      note: "All assigned and accepted work items",
      icon: Activity,
      accent: "text-violet-600",
      ring: "ring-violet-500/20",
      bg: "from-violet-500/10 via-violet-500/5 to-transparent",
    },
    {
      key: "active",
      title: "Active orders",
      value: openCount,
      note: "In progress or waiting for next action",
      icon: Timer,
      accent: "text-amber-600",
      ring: "ring-amber-500/20",
      bg: "from-amber-500/10 via-amber-500/5 to-transparent",
    },
    {
      key: "completed",
      title: "Completed",
      value: completedCount,
      note: "Successfully finished deliveries",
      icon: CheckCircle2,
      accent: "text-emerald-600",
      ring: "ring-emerald-500/20",
      bg: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    },
  ] as const

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pt-6 pb-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Creator Orders</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Accepted requests become orders here. Buyers fund them through Stripe escrow, then you
          deliver the work for buyer review and approval.
        </p>
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

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
              <PackageCheck className="size-6" />
            </span>
            <h2 className="text-base font-semibold text-foreground">No orders yet</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Accept buyer requests in the Requests queue to create orders.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Buyer</TableHead>
                <TableHead>Order</TableHead>
                {/* <TableHead>Payment</TableHead> */}
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-center">Price</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const buyer = safeBuyerSummary(order.buyer_profile_data)
                return (
                  <TableRow key={order.id}>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2.5">
                        {buyer.avatarUrl ? (
                          <img src={buyer.avatarUrl} alt={buyer.displayName} className="size-9 rounded-full object-cover shadow-xs" />
                        ) : (
                          <span className="inline-flex size-9 items-center justify-center rounded-full bg-muted/80 text-muted-foreground shadow-xs" aria-hidden>
                            <UserRound className="size-4.5" />
                          </span>
                        )}
                        <span className="text-sm font-semibold tracking-tight text-foreground">{buyer.displayName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground">{order.package_title}</span>
                        <span className="text-xs text-muted-foreground">#{order.id.slice(0, 8)}...</span>
                      </div>
                    </TableCell>
                    {/* <TableCell>
                      <Badge variant="outline" className="bg-primary/10 text-xs">
                        {paymentStatusLabel[order.payment_status]}
                      </Badge>
                    </TableCell> */}
                    <TableCell>
                      <Badge variant="secondary" className={cn("font-medium px-2.5 py-0.5 rounded-md", orderStatusClass[order.status])}>
                        {orderStatusLabel[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatCreatedAt(order.created_at)}</TableCell>
                    <TableCell className="text-center font-semibold text-foreground">{formatCurrency(order.package_price)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="outline" size="icon-sm" aria-label="Order actions">
                                <MoreVertical className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => openViewModal(order)}>
                              <Eye className="size-4" />
                              View
                            </DropdownMenuItem>
                            {order.status === "approved" &&
                            (order.payment_status === "pending" || order.payment_status === "paid") ? (
                              <DropdownMenuItem onClick={() => openDeliveryDialog(order)}>
                                <PackageCheck className="size-4" />
                                Deliver order
                              </DropdownMenuItem>
                            ) : null}
                            {order.payment_status === "pending" ? (
                              <DropdownMenuItem onClick={() => openStatusModal(order)}>
                                <NotebookPen className="size-4" />
                                Update
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </section>
      <Dialog
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrder(null)
            setStatusReviewPick({ ...EMPTY_ASSET_PICKS })
            setStatusReviewNote("")
            setStatusReviewOptions({})
            setError("")
          }
        }}
      >
        <DialogContent className={cn("max-h-[90vh] overflow-y-auto", nextStatus === "reviewing" ? "sm:max-w-2xl" : "sm:max-w-md")}>
          <DialogHeader>
            <DialogTitle>Update order status</DialogTitle>
            <DialogDescription>
              Confirm status update for <span className="font-medium text-foreground">{selectedOrder?.package_title ?? "order"}</span>.
              {nextStatus === "reviewing" ? (
                <>
                  {" "}
                  Choose character, persona, lorebook, and avatar (background optional). The buyer will open the in-app preview
                  to approve or request changes.
                </>
              ) : (
                <>
                  {" "}
                  Prefer <span className="font-medium text-foreground">Deliver order</span> from the table when submitting assets so
                  delivery metadata is recorded. Use <span className="font-medium text-foreground">Delivered</span> here only when you
                  need to correct status manually.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Next status</p>
              <Select value={nextStatus} onValueChange={(value) => setNextStatus(value as OrderStatusPatch)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="on_hold">On check Hold</SelectItem>
                  <SelectItem value="reviewing">Send for Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {nextStatus === "reviewing" ? (
              <div className="space-y-4 border-t border-border/60 pt-4">
                <p className="text-xs font-semibold text-muted-foreground">
                  All asset fields are optional. Select only what you want to send for review.
                </p>
                {isLoadingStatusReviewOptions ? (
                  <p className="text-sm text-muted-foreground">Loading your workspace assets…</p>
                ) : (
                  REVIEW_ROWS.map(({ pickKey, optionsKey, label, required }) => {
                    const items = statusReviewOptions[optionsKey] ?? []
                    const current = statusReviewPick[pickKey]
                    const selectValue = current || "Select an Asset"
                    const noneLabel =
                      pickKey === "background" ? "No background" : required ? `Select ${label.toLowerCase()}…` : "None"

                    return (
                      <div key={pickKey} className="space-y-2">
                        <label className="text-sm font-semibold text-foreground" htmlFor={`review-pick-${pickKey}`}>
                          {label}
                        </label>
                        {items.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No published {label.toLowerCase()} assets in workspace yet.</p>
                        ) : (
                          <Select
                            value={selectValue}
                            onValueChange={(value) =>
                              setStatusReviewPick((prev) => ({
                                ...prev,
                                [pickKey]: value === "Select an Asset" ? "" : value,
                              }))
                            }
                          >
                            <SelectTrigger id={`review-pick-${pickKey}`} className="w-full">
                              <span className={cn("truncate", !current && "text-muted-foreground")}>
                                {selectedOptionLabel(items, current, noneLabel)}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Select an Asset">{noneLabel}</SelectItem>
                              {items.map((item) => (
                                <SelectItem key={item.assetId} value={item.assetId}>
                                  {item.subtitle ? `${item.title} · ${item.subtitle}` : item.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    )
                  })
                )}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Note for buyer (optional)</p>
                  <Textarea
                    value={statusReviewNote}
                    onChange={(event) => setStatusReviewNote(event.target.value)}
                    placeholder="Help the buyer understand what to review."
                    className="min-h-24"
                  />
                </div>
              </div>
            ) : null}
            {error ? <p className="text-xs text-rose-600">{error}</p> : null}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedOrder(null)
                setStatusReviewPick({ ...EMPTY_ASSET_PICKS })
                setStatusReviewNote("")
                setStatusReviewOptions({})
                setError("")
              }}
              disabled={isUpdatingStatus}
            >
              Cancel
            </Button>
            <Button onClick={() => void confirmStatusUpdate()} disabled={isUpdatingStatus}>
              {isUpdatingStatus ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Confirm update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0">
          {orderToView && (() => {
            const buyer = safeBuyerSummary(orderToView.buyer_profile_data)
            return (
              <>
                <DialogHeader className="border-b border-border/60 px-6 pt-6 pb-4">
                  <div className="flex items-center gap-3 mb-1">
                    {buyer.avatarUrl ? (
                      <img
                        src={buyer.avatarUrl}
                        alt={buyer.displayName || "Buyer"}
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        className="inline-flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground"
                        aria-hidden
                      >
                        <UserRound className="size-5" />
                      </span>
                    )}
                    <div className="flex flex-col text-left">
                      <DialogTitle className="text-base font-semibold">
                        {orderToView.package_title}
                      </DialogTitle>
                      <DialogDescription className="text-xs">
                        Order #{orderToView.id.slice(0, 8)}...
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
                  <div className="mt-4 divide-y divide-border/50">
                    <div className="pb-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Buyer</p>
                        <p className="mt-0.5 font-medium text-foreground">{buyer.displayName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Status</p>
                        <Badge
                          variant="secondary"
                          className={cn("mt-1 font-medium px-2 py-0.5 rounded-md text-xs", orderStatusClass[orderToView.status])}
                        >
                          {orderStatusLabel[orderToView.status]}
                        </Badge>
                      </div>
                    </div>

                    <div className="py-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Earnings</p>
                        <p className="mt-0.5 text-lg font-semibold text-foreground">
                          {formatCurrency(orderToView.package_price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Payment</p>
                        <p className="mt-0.5 text-base font-medium text-foreground">
                          {paymentStatusLabel[orderToView.payment_status]}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <p className="mb-3 text-xs font-semibold text-muted-foreground">Order details</p>
                      <OrderSnapshotDetails order={orderToView} />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-2">
                    {(orderToView.status === "funded" ||
                      orderToView.status === "in_progress" ||
                      orderToView.status === "on_hold" ||
                      orderToView.status === "approved") &&
                      (orderToView.payment_status === "pending" || orderToView.payment_status === "paid") ? (
                      <Button
                        onClick={() => {
                          setIsViewDialogOpen(false)
                          openDeliveryDialog(orderToView)
                        }}
                        className="px-6"
                      >
                        Deliver order
                      </Button>
                    ) : null}
                    {(orderToView.status === "delivered" ||
                      orderToView.status === "reviewing" ||
                      orderToView.status === "approved" ||
                      orderToView.status === "completed") ? (
                      <Link
                        href={`/orders/${orderToView.id}/preview`}
                        className={cn(buttonVariants({ variant: "outline" }), "px-6")}
                      >
                        Open buyer preview
                      </Link>
                    ) : null}
                    <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="px-6">
                      Close
                    </Button>
                    <Button onClick={() => {
                      setIsViewDialogOpen(false);
                      openStatusModal(orderToView);
                    }} className="px-6">
                      Update status
                    </Button>
                  </div>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(deliveryOrder)}
        onOpenChange={(open) => {
          if (!open) {
            setDeliveryOrder(null)
            setDeliveryPick({ ...EMPTY_ASSET_PICKS })
            setDeliveryNote("")
            setDeliveryOptions({})
            setError("")
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deliver order assets</DialogTitle>
            <DialogDescription>
              Each field starts empty—choose one asset per type where needed, or leave a row blank. Include at least one
              attachment before submitting. The buyer will preview selections before approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isLoadingDeliveryOptions ? (
              <p className="text-sm text-muted-foreground">Loading your workspace assets…</p>
            ) : (
              DELIVERY_PICK_ROWS.map(({ pickKey, optionsKey, label }) => {
                const items = deliveryOptions[optionsKey] ?? []
                const current = deliveryPick[pickKey]
                const selectValue = current || "Select an Asset"
                const noneLabel = "Leave empty"

                return (
                  <div key={`delivery-${pickKey}`} className="space-y-2">
                    <label className="text-sm font-semibold text-foreground" htmlFor={`delivery-pick-${pickKey}`}>
                      {label} <span className="font-normal text-muted-foreground">(optional)</span>
                    </label>
                    {items.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No {label.toLowerCase()} assets available in workspace.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <Select
                          value={selectValue}
                          onValueChange={(value) =>
                            setDeliveryPick((prev) => ({
                              ...prev,
                              [pickKey]: value === "Select an Asset" ? "" : value,
                            }))
                          }
                        >
                          <SelectTrigger id={`delivery-pick-${pickKey}`} className="w-full">
                            <span className={cn("truncate", !current && "text-muted-foreground")}>
                              {selectedOptionLabel(items, current, noneLabel)}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Select an Asset">{noneLabel}</SelectItem>
                            {items.map((item) => (
                              <SelectItem key={item.assetId} value={item.assetId}>
                                {item.subtitle ? `${item.title} · ${item.subtitle}` : item.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {current ? (
                          <div className="flex items-center gap-2">
                            <Link
                              href={creatorWorkspacePreviewHref(pickKey, current)}
                              target="_blank"
                              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 px-2.5")}
                            >
                              <ExternalLink className="size-3.5" />
                              Preview
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5"
                              onClick={() => void copyAssetSelection(pickKey, current)}
                            >
                              <Copy className="size-3.5" />
                              Copy
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                )
              })
            )}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Delivery note</p>
              <Textarea
                value={deliveryNote}
                onChange={(event) => setDeliveryNote(event.target.value)}
                placeholder="Add a note to help the buyer review the delivery."
                className="min-h-28"
              />
            </div>
            <div
              className={cn(
                "rounded-lg border p-3",
                payoutReady
                  ? "border-emerald-300/60 bg-emerald-50 text-emerald-800 dark:border-emerald-600/40 dark:bg-emerald-950/30 dark:text-emerald-200"
                  : "border-rose-300/70 bg-rose-50 text-rose-700 dark:border-rose-600/40 dark:bg-rose-950/30 dark:text-rose-300"
              )}
            >
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
                <CreditCard className="size-4" />
                Stripe payout setup
              </p>
              {isLoadingPayoutProfile ? (
                <p className="mt-1 text-xs">Checking payout profile…</p>
              ) : payoutReady ? (
                <p className="mt-1 text-xs">Payout account is ready. Delivery can release funds automatically.</p>
              ) : (
                <p className="mt-1 text-xs">
                  Missing: {missingPayoutFields.join(", ")}. Complete these in profile before delivering.
                </p>
              )}
              <div className="mt-2">
                <Link
                  href="/dashboard/creator/profile"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 px-2.5")}
                >
                  <ExternalLink className="size-3.5" />
                  Open profile
                </Link>
              </div>
            </div>
            {error ? <p className="text-xs text-rose-600">{error}</p> : null}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeliveryOrder(null)
                setDeliveryPick({ ...EMPTY_ASSET_PICKS })
                setDeliveryNote("")
                setDeliveryOptions({})
                setError("")
              }}
              disabled={isSubmittingDelivery}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void submitDelivery()}
              disabled={isSubmittingDelivery || deliveredAssetCount === 0 || isLoadingPayoutProfile || !payoutReady}
            >
              {isSubmittingDelivery ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Deliver assets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
