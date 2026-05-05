"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { MoveLeft } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { PostABidForm, type PostABidFormValues } from "@/features/site/bids/components/post-a-bid-form"
import { BidAssetRequestForm } from "../../../../features/site/bids/components/bid-asset-request-form"
import { cn } from "@/lib/utils"

export default function NewPostABidPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<"details" | "assets">("details")
  const [bidValues, setBidValues] = useState<PostABidFormValues | null>(null)

  function handleDetailsNext(values: PostABidFormValues) {
    setBidValues(values)
    setPhase("assets")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleFinalSubmit(requestPayload: Record<string, unknown>) {
    if (!bidValues) return

    const response = await fetch("/api/site/bids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...bidValues, requestPayload }),
    })
    if (!response.ok) return
    router.push("/post-a-bid")
    router.refresh()
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
          initialValues={bidValues ?? undefined}
          submitLabel="Next"
          onCancel={() => router.push("/post-a-bid")}
          onSubmit={handleDetailsNext}
        />
      ) : bidValues ? (
        <BidAssetRequestForm
          limits={{
            character: bidValues.character,
            persona: bidValues.persona,
            lorebook: bidValues.lorebook,
            background: bidValues.background,
            avatar: bidValues.avatar,
          }}
          onBack={() => setPhase("details")}
          onSubmit={handleFinalSubmit}
        />
      ) : null}
    </main>
  )
}
