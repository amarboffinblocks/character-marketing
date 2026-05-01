"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { MoveLeft } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { PostABidForm, type PostABidFormValues } from "@/features/site/bids/components/post-a-bid-form"
import type { BidItem } from "@/features/site/bids/types"
import { cn } from "@/lib/utils"

export default function EditPostABidPage() {
  const router = useRouter()
  const params = useParams<{ bidId: string }>()
  const [bid, setBid] = useState<BidItem | null>(null)
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

  async function handleSubmit(values: PostABidFormValues) {
    const response = await fetch(`/api/site/bids/${encodeURIComponent(params.bidId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
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

      <PostABidForm
        initialValues={bid}
        submitLabel="Save changes"
        onCancel={() => router.push("/post-a-bid")}
        onSubmit={handleSubmit}
      />
    </main>
  )
}
