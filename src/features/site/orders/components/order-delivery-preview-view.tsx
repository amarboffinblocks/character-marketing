"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, LoaderCircle, ShieldCheck, Star } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { CharacterReadView } from "@/features/creator/workspace/characters/character-read-view"
import { PersonaReadView } from "@/features/creator/workspace/personas/persona-read-view"
import { LorebookReadView } from "@/features/creator/workspace/lorebooks/lorebook-read-view"
import { AvatarReadView } from "@/features/creator/workspace/avatars/avatar-read-view"
import { BackgroundReadView } from "@/features/creator/workspace/backgrounds/background-read-view"
import { PreviewSecurityShield } from "@/features/site/orders/components/preview-security-shield"
import { cn } from "@/lib/utils"

type DeliverableSummary = {
  assetType: "character" | "persona" | "lorebook" | "avatar" | "background"
  assetId: string
  title: string
  creatorId?: string
}

const assetTypeLabel = {
  character: "Character",
  persona: "Persona",
  lorebook: "Lorebook",
  avatar: "Avatar",
  background: "Background",
} as const

export function OrderDeliveryPreviewView({ orderId }: { orderId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [deliverables, setDeliverables] = useState<DeliverableSummary[]>([])
  const [deliveryNote, setDeliveryNote] = useState("")
  const [viewerLabel, setViewerLabel] = useState("")
  const [isBuyer, setIsBuyer] = useState(false)
  const [orderStatus, setOrderStatus] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [revisionMessage, setRevisionMessage] = useState("")
  const [actionError, setActionError] = useState("")
  const [actionBusy, setActionBusy] = useState<"approve" | "request" | null>(null)
  const [actionSuccess, setActionSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    let mounted = true

    async function load() {
      setIsLoading(true)
      setLoadError("")
      setActionSuccess("")
      setActionError("")
      try {
        const response = await fetch(`/api/site/orders/${encodeURIComponent(orderId)}/deliverables`)
        const json = (await response.json()) as {
          error?: string
          deliveryNote?: string
          viewerLabel?: string
          deliverables?: DeliverableSummary[]
          isBuyer?: boolean
          orderStatus?: string
          paymentStatus?: string
        }
        if (!response.ok) {
          throw new Error(json.error || "Unable to load delivered assets.")
        }
        if (!mounted) return
        setDeliverables(Array.isArray(json.deliverables) ? json.deliverables : [])
        setDeliveryNote(json.deliveryNote ?? "")
        setViewerLabel(json.viewerLabel ?? "")
        setIsBuyer(Boolean(json.isBuyer))
        setOrderStatus(typeof json.orderStatus === "string" ? json.orderStatus : "")
        setPaymentStatus(typeof json.paymentStatus === "string" ? json.paymentStatus : "")
      } catch (loadError) {
        if (!mounted) return
        setLoadError(loadError instanceof Error ? "No preview yet." : "No preview yet.")
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    void load()
    return () => {
      mounted = false
    }
  }, [orderId])

  const showBuyerActions =
    isBuyer && deliverables.length > 0 && (orderStatus === "delivered" || orderStatus === "approved")

  const canApproveFromPreview = showBuyerActions && paymentStatus === "pending"
  const canRequestRevision = showBuyerActions

  async function handleApprove() {
    if (actionBusy) return
    setActionBusy("approve")
    setActionError("")
    setActionSuccess("")
    try {
      const response = await fetch(`/api/site/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      })
      const json = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(json.error || "Unable to approve.")
      }
      setActionSuccess("Draft approved. The creator can now perform the final delivery.")
      router.refresh()
      const reload = async () => {
        const r = await fetch(`/api/site/orders/${encodeURIComponent(orderId)}/deliverables`)
        const j = (await r.json()) as {
          deliverables?: DeliverableSummary[]
          deliveryNote?: string
          orderStatus?: string
          paymentStatus?: string
        }
        if (r.ok) {
          setDeliverables(Array.isArray(j.deliverables) ? j.deliverables : [])
          setDeliveryNote(j.deliveryNote ?? "")
          setOrderStatus(typeof j.orderStatus === "string" ? j.orderStatus : "")
          setPaymentStatus(typeof j.paymentStatus === "string" ? j.paymentStatus : "")
        }
      }
      void reload()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Unable to approve.")
    } finally {
      setActionBusy(null)
    }
  }

  async function handleRequestRevision() {
    if (actionBusy) return
    const message = revisionMessage.trim()
    if (!message) {
      setActionError("Describe what you’d like updated before sending.")
      return
    }
    setActionBusy("request")
    setActionError("")
    setActionSuccess("")
    try {
      const response = await fetch(`/api/site/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request_update", message }),
      })
      const json = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(json.error || "Unable to send revision request.")
      }
      setRevisionMessage("")
      setActionSuccess("Revision request sent. The creator can update the work and deliver again.")
      router.refresh()
      const reload = async () => {
        const r = await fetch(`/api/site/orders/${encodeURIComponent(orderId)}/deliverables`)
        const j = (await r.json()) as {
          deliverables?: DeliverableSummary[]
          deliveryNote?: string
          orderStatus?: string
          paymentStatus?: string
        }
        if (r.ok) {
          setDeliverables(
            Array.isArray(j.deliverables) 
              ? j.deliverables.map(d => ({ ...d, creatorId: d.creatorId || "" })) 
              : []
          )
          setDeliveryNote(j.deliveryNote ?? "")
          setOrderStatus(typeof j.orderStatus === "string" ? j.orderStatus : "")
          setPaymentStatus(typeof j.paymentStatus === "string" ? j.paymentStatus : "")
        }
      }
      void reload()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Unable to send revision request.")
    } finally {
      setActionBusy(null)
    }
  }

  const selectedAsset = useMemo(() => {
    const assetId = searchParams.get("assetId")?.trim()
    const assetType = searchParams.get("assetType")?.trim()
    const exact = deliverables.find((item) => item.assetId === assetId && item.assetType === assetType)
    return exact ?? deliverables[0] ?? null
  }, [deliverables, searchParams])

  const apiPrefix = selectedAsset
    ? `/api/site/orders/${encodeURIComponent(orderId)}/deliverables/${selectedAsset.assetType}`
    : ""

  return (
    <main className="relative mx-auto w-full max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
      <PreviewSecurityShield watermark={viewerLabel || `order-${orderId.slice(0, 8)}`} />

      <section className="relative z-10 rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Delivery preview
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Review each linked asset below in your browser. When you are ready, use Approve or Request changes in the
              sidebar—no need to capture screenshots for feedback.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/orders" className={cn(buttonVariants({ variant: "outline" }))}>
              Back to orders
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivered assets</CardTitle>
              <CardDescription>Open each asset in the same read-only format used across the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading delivered assets…</p>
              ) : loadError ? (
                <p className="text-sm text-muted-foreground">{loadError}</p>
              ) : deliverables.length === 0 ? (
                <p className="text-sm text-muted-foreground">No delivered assets have been attached yet.</p>
              ) : (
                deliverables.map((asset) => {
                  const isActive =
                    selectedAsset?.assetId === asset.assetId && selectedAsset.assetType === asset.assetType
                  return (
                    <Link
                      key={`${asset.assetType}-${asset.assetId}`}
                      href={`/orders/${orderId}/preview?assetType=${asset.assetType}&assetId=${asset.assetId}`}
                      className={cn(
                        "flex items-center justify-between rounded-xl border px-3 py-3 text-sm transition-colors",
                        isActive
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border/70 bg-background hover:bg-muted/30"
                      )}
                    >
                      <div>
                        <p className="font-medium">{asset.title}</p>
                        <p className="text-xs text-muted-foreground">{assetTypeLabel[asset.assetType]}</p>
                      </div>
                      <Eye className="size-4 text-muted-foreground" />
                    </Link>
                  )
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review &amp; decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-emerald-800 dark:text-emerald-200">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                <p>
                  Use the asset list to inspect the real deliverables in-app. Approve when you are ready for final delivery, or
                  request changes with a clear note for the creator.
                </p>
              </div>
              {deliveryNote ? (
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Creator note
                  </p>
                  <p className="whitespace-pre-wrap text-foreground">{deliveryNote}</p>
                </div>
              ) : null}
              {showBuyerActions ? (
                <div className="space-y-3 rounded-xl border border-border/70 bg-background p-3">
                  <p className="text-xs font-semibold text-foreground">Your decision</p>
                  
                  {canApproveFromPreview && orderStatus === "delivered" ? (
                    <Button
                      type="button"
                      className="inline-flex w-full items-center justify-center gap-2"
                      disabled={actionBusy !== null}
                      onClick={() => void handleApprove()}
                    >
                      {actionBusy === "approve" ? <LoaderCircle className="size-4 animate-spin shrink-0" /> : null}
                      <span>Approve Draft</span>
                    </Button>
                  ) : orderStatus === "approved" ? (
                    <div className="space-y-3">
                      <p className="text-xs text-emerald-600 font-medium">
                        You have approved the draft. Waiting for the creator to perform final delivery to your inventory.
                      </p>
                      <Link 
                        href={`/creators/${deliverables[0]?.creatorId}/review`}
                        className={cn(buttonVariants({ variant: "outline" }), "w-full gap-2")}
                      >
                        <Star className="size-4" />
                        <span>Leave a review</span>
                      </Link>
                    </div>
                  ) : orderStatus === ("completed" as string) || (orderStatus === "delivered" && paymentStatus === "paid") ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Order is complete and assets have been transferred to your inventory!
                      </p>
                      <Link 
                        href={`/creators/${deliverables[0]?.creatorId}/review`}
                        className={cn(buttonVariants({ variant: "default" }), "w-full gap-2")}
                      >
                        <Star className="size-4" />
                        <span>Leave a review</span>
                      </Link>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Approval is available when a delivery is pending review.
                    </p>
                  )}
                  {canRequestRevision && orderStatus === "delivered" && paymentStatus === "pending" ? (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground" htmlFor="revision-note">
                        Request changes
                      </label>
                      <Textarea
                        id="revision-note"
                        value={revisionMessage}
                        onChange={(e) => setRevisionMessage(e.target.value)}
                        placeholder="What should the creator adjust?"
                        className="min-h-24 text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="inline-flex w-full items-center justify-center gap-2"
                        disabled={actionBusy !== null}
                        onClick={() => void handleRequestRevision()}
                      >
                        {actionBusy === "request" ? <LoaderCircle className="size-4 animate-spin shrink-0" /> : null}
                        <span>Send revision request</span>
                      </Button>
                    </div>
                  ) : null}
                  {actionError ? <p className="text-xs text-rose-600">{actionError}</p> : null}
                  {actionSuccess ? <p className="text-xs text-emerald-700 dark:text-emerald-300">{actionSuccess}</p> : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="min-h-[420px]">
          {selectedAsset ? (
            <>
              {selectedAsset.assetType === "character" ? (
                <CharacterReadView
                  entityId={selectedAsset.assetId}
                  apiPathPrefix={apiPrefix}
                  backHref="/orders"
                  backLabel="Back to orders"
                />
              ) : null}
              {selectedAsset.assetType === "persona" ? (
                <PersonaReadView
                  entityId={selectedAsset.assetId}
                  apiPathPrefix={apiPrefix}
                  backHref="/orders"
                  backLabel="Back to orders"
                />
              ) : null}
              {selectedAsset.assetType === "lorebook" ? (
                <LorebookReadView
                  entityId={selectedAsset.assetId}
                  apiPathPrefix={apiPrefix}
                  backHref="/orders"
                  backLabel="Back to orders"
                />
              ) : null}
              {selectedAsset.assetType === "avatar" ? (
                <AvatarReadView
                  entityId={selectedAsset.assetId}
                  apiPathPrefix={apiPrefix}
                  backHref="/orders"
                  backLabel="Back to orders"
                />
              ) : null}
              {selectedAsset.assetType === "background" ? (
                <BackgroundReadView
                  entityId={selectedAsset.assetId}
                  apiPathPrefix={apiPrefix}
                  backHref="/orders"
                  backLabel="Back to orders"
                />
              ) : null}
            </>
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-sm text-muted-foreground">
                No asset selected yet.
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  )
}
