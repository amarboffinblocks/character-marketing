"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { MoveLeft } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { PostABidForm, type PostABidFormValues } from "@/features/site/bids/components/post-a-bid-form"
import { BidAssetRequestForm } from "@/features/site/bids/components/bid-asset-request-form"
import type { BidItem } from "@/features/site/bids/types"
import { cn } from "@/lib/utils"

export default function EditPostABidPage() {
  const router = useRouter()
  const params = useParams<{ bidId: string }>()
  const [bid, setBid] = useState<BidItem | null>(null)
  const [phase, setPhase] = useState<"details" | "assets">("details")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function loadBid() {
      setLoading(true)
      try {
        const response = await fetch(`/api/site/bids/${encodeURIComponent(params.bidId)}`, { cache: "no-store" })
        const data = (await response.json()) as { bid?: BidItem }
        if (!response.ok || !data.bid) {
          if (mounted) setBid(null)
          return
        }
        if (mounted) setBid(data.bid)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (params.bidId) {
      void loadBid()
    }
    return () => {
      mounted = false
    }
  }, [params.bidId])

  function handleDetailsNext(values: PostABidFormValues) {
    setBid({ ...bid, ...values } as BidItem)
    setPhase("assets")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleFinalSubmit(requestPayload: Record<string, unknown>) {
    if (!bid) return

    const response = await fetch(`/api/site/bids/${encodeURIComponent(params.bidId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...bid, requestPayload }),
    })
    if (!response.ok) return
    router.push("/post-a-bid")
    router.refresh()
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-7xl space-y-4 px-4 pt-24 pb-8 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">Loading bid...</p>
      </main>
    )
  }

  if (!bid) {
    return (
      <main className="mx-auto w-full max-w-7xl space-y-4 px-4 pt-24 pb-8 sm:px-6 lg:px-8">
        <Link href="/post-a-bid" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit")}>
          <MoveLeft className="size-4" />
          Back to bids
        </Link>
        <p className="text-sm text-muted-foreground">Bid not found.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-24 pb-8 sm:px-6 lg:px-8">
      <Link href="/post-a-bid" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit")}>
        <MoveLeft className="size-4" />
        Back to bids
      </Link>

      {/* Phase indicator */}
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold",
            phase === "details"
              ? "bg-primary text-primary-foreground"
              : "bg-emerald-600 text-white"
          )}
        >
          {phase === "details" ? "1" : "✓"}
        </span>
        <span className={cn("text-sm font-medium", phase === "details" ? "text-foreground" : "text-emerald-700 dark:text-emerald-400")}>
          Bid Details
        </span>
        <div className="h-px flex-1 bg-border" />
        <span
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold",
            phase === "assets"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          2
        </span>
        <span className={cn("text-sm font-medium", phase === "assets" ? "text-foreground" : "text-muted-foreground")}>
          Asset Requirements
        </span>
      </div>

      {phase === "details" ? (
        <PostABidForm
          initialValues={bid}
          submitLabel="Next"
          onCancel={() => router.push("/post-a-bid")}
          onSubmit={handleDetailsNext}
        />
      ) : (
        <BidAssetRequestForm
          limits={{
            character: bid.character,
            persona: bid.persona,
            lorebook: bid.lorebook,
            background: bid.background,
            avatar: bid.avatar,
          }}
          initialData={bid.requestPayload as any}
          onBack={() => setPhase("details")}
          onSubmit={handleFinalSubmit}
        />
      )}
    </main>
  )
}
