"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, UserRound, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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

const requestTypeLabel: Record<RequestType, string> = {
  custom_package: "Custom package",
  preselect_package: "Pre-select",
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

function safeCreatorSummary(profileData: unknown) {
  const root = profileData && typeof profileData === "object" ? (profileData as Record<string, unknown>) : null
  const creator =
    root && root.creator && typeof root.creator === "object" ? (root.creator as Record<string, unknown>) : null

  const displayName =
    (creator && typeof creator.displayName === "string" && creator.displayName.trim()) ||
    (creator && typeof creator.name === "string" && creator.name.trim()) ||
    ""

  const handle = creator && typeof creator.handle === "string" ? creator.handle.trim() : ""
  const avatarUrl = creator && typeof creator.avatarUrl === "string" ? creator.avatarUrl.trim() : ""

  return {
    displayName,
    handle: handle.startsWith("@") || handle.length === 0 ? handle : `@${handle}`,
    avatarUrl: avatarUrl.length > 0 ? avatarUrl : null,
  }
}interface OrdersClientTableProps {
  requests: BuyerRequestRow[]
}

function PayloadDetailsView({ order }: { order: BuyerRequestRow }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  let payload = order.request_payload
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload)
    } catch (e) {
      payload = undefined
    }
  }
  const parsedPayload = payload as Record<string, any> | undefined
  if (!parsedPayload) return null

  const details = parsedPayload.details || {}
  const notes = parsedPayload.notes || parsedPayload.instructions || ""

  if (order.request_type === "custom_package") {
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
                  .map((item: any) => 
                    typeof item === "string" 
                      ? item 
                      : item?.characterName || item?.personaName || item?.lorebookName || item?.backgroundName || item?.avatarName || `Custom ${key}`
                  )
                  .slice(0, 2)
                  .join(", ")

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveCategory(key)}
                    className="flex flex-col items-start text-left rounded-xl border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-all duration-200 shadow-2xs cursor-pointer w-full group"
                  >
                    <p className="text-xs font-semibold capitalize text-muted-foreground group-hover:text-primary transition-colors">
                      {key}s ({items.length})
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-foreground/90 truncate w-full">
                      {firstNames}{items.length > 2 ? "..." : ""}
                    </p>
                    <span className="mt-2 text-[10px] font-medium text-primary/70 group-hover:text-primary group-hover:underline">
                      Click to view details →
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <h4 className="text-sm font-bold capitalize text-foreground flex items-center gap-1">
                  <span className="text-primary">{activeCategory}s</span> Details
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs cursor-pointer hover:bg-primary/10 hover:text-primary"
                  onClick={() => setActiveCategory(null)}
                >
                  <ChevronLeft className="size-3.5 mr-1" />
                  Back
                </Button>
              </div>

              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 pt-1">
                {Array.isArray(details[activeCategory]) && details[activeCategory].map((item: any, idx: number) => {
                  const name = typeof item === "string" 
                    ? item 
                    : item?.characterName || item?.personaName || item?.lorebookName || item?.backgroundName || item?.avatarName || `Custom ${activeCategory} #${idx + 1}`

                  return (
                    <div key={idx} className="rounded-xl border border-border bg-background/50 p-4 space-y-3 shadow-2xs">
                      <p className="font-semibold text-sm text-primary border-b border-border/40 pb-1.5">{name}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {Object.entries(item).map(([k, v]) => {
                          if (!v || k === "id") return null
                          if (["characterName", "personaName", "lorebookName", "backgroundName", "avatarName"].includes(k)) return null
                          
                          const label = k
                            .replace(/([A-Z])/g, ' $1')
                            .trim()
                            .replace(/^message To Creator$/, "Note for Creator")
                            .replace(/^scenario Location Universe$/, "Scenario / Location / Universe")
                            .replace(/^estimated Keyword Count$/, "Estimated Keyword Count")
                            .replace(/^personality Summary$/, "Personality Summary")
                            .replace(/^first Message$/, "First Message")
                            .replace(/^alternative First Messages$/, "Alternative First Messages")
                            .replace(/^example Dialogue Style$/, "Dialogue Style")
                          
                          return (
                            <div key={k} className="sm:col-span-2 not-first:border-t border-border/20 pt-2 first:pt-0">
                              <span className="font-semibold text-foreground/95 block text-xs capitalize mb-1">{label}</span>
                              <p className="whitespace-pre-wrap text-muted-foreground/85 text-xs leading-relaxed">{String(v)}</p>
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

        {notes && (
          <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/10 p-3">
            <h4 className="text-xs font-semibold text-muted-foreground">Instructions</h4>
            <p className="text-sm text-foreground whitespace-pre-wrap">{notes}</p>
          </div>
        )}
      </div>
    )
  }

  if (order.request_type === "preselect_package") {
    const requestedAssets = parsedPayload.requestedAssets || {}
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

        {notes && (
          <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/10 p-3">
            <h4 className="text-xs font-semibold text-muted-foreground">Instructions</h4>
            <p className="text-sm text-foreground whitespace-pre-wrap">{notes}</p>
          </div>
        )}
      </div>
    )
  }

  return null
}

export function OrdersClientTable({ requests }: OrdersClientTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<BuyerRequestRow | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const openDialog = (order: BuyerRequestRow) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="py-4">Creator</TableHead>
            <TableHead>Request</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-center">Price</TableHead>
            <TableHead className="w-[120px] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => {
            const creator = safeCreatorSummary(req.creator_profile_data)
            const creatorName = creator.displayName || "Creator"
            const creatorHandle = creator.handle
            const creatorSlug = req.creator_id
            return (
              <TableRow key={req.id} className="hover:bg-muted/10">
                <TableCell className="py-5">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex size-9 items-center justify-center rounded-full bg-muted/80 text-muted-foreground shadow-xs"
                      aria-hidden
                    >
                      <UserRound className="size-4.5" />
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold tracking-tight text-foreground">
                        {creatorName}
                      </span>
                      {creatorHandle ? (
                        <span className="text-xs text-muted-foreground/85">{creatorHandle}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground/85">
                          {creatorSlug.slice(0, 8)}…
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground">{req.package_title}</span>
                    <span className="text-xs text-muted-foreground">#{req.id}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("font-medium px-2.5 py-0.5 rounded-md", requestStatusClass[req.status])}
                  >
                    {requestStatusLabel[req.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatCreatedAt(req.created_at)}
                </TableCell>
                <TableCell className="text-center font-semibold text-foreground">
                  {formatCurrency(req.package_price)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 font-medium px-4 cursor-pointer"
                      onClick={() => openDialog(req)}
                    >
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          {selectedOrder && (() => {
            const creator = safeCreatorSummary(selectedOrder.creator_profile_data)
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className="inline-flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground"
                      aria-hidden
                    >
                      <UserRound className="size-5" />
                    </span>
                    <div className="flex flex-col text-left">
                      <DialogTitle className="text-base font-semibold">
                        {selectedOrder.package_title}
                      </DialogTitle>
                      <DialogDescription className="text-xs">
                        Order ID: #{selectedOrder.id}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="mt-4 divide-y divide-border/50">
                  <div className="pb-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Creator</p>
                      <p className="mt-0.5 font-medium text-foreground">{creator.displayName || "Creator"}</p>
                      <p className="text-xs text-muted-foreground">{creator.handle}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Status</p>
                      <Badge
                        variant="secondary"
                        className={cn("mt-1 font-medium px-2 py-0.5 rounded-md text-xs", requestStatusClass[selectedOrder.status])}
                      >
                        {requestStatusLabel[selectedOrder.status]}
                      </Badge>
                    </div>
                  </div>

                  <div className="py-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Price</p>
                      <p className="mt-0.5 text-lg font-semibold text-foreground">
                        {formatCurrency(selectedOrder.package_price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Tokens</p>
                      <p className="mt-0.5 text-base font-medium text-foreground">
                        {selectedOrder.tokens_label || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="py-4 text-sm">
                    <p className="text-xs font-semibold text-muted-foreground">Created On</p>
                    <p className="mt-0.5 font-medium text-foreground">
                      {new Date(selectedOrder.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="pt-4">
                    <PayloadDetailsView order={selectedOrder} />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Link
                    href={`/creators/${selectedOrder.creator_id}`}
                    className={cn(buttonVariants({ variant: "outline" }), "px-4")}
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Visit Profile
                  </Link>
                  <Button onClick={() => setIsDialogOpen(false)} className="px-4">
                    Close
                  </Button>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </>
  )
}
