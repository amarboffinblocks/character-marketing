"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { MoveLeft } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { PostABidForm, type PostABidFormValues } from "@/features/site/bids/components/post-a-bid-form"
import { getBidById } from "@/features/site/bids/data/bids-data"
import { cn } from "@/lib/utils"

export default function EditPostABidPage() {
  const router = useRouter()
  const params = useParams<{ bidId: string }>()
  const bid = getBidById(params.bidId)

  function handleSubmit(values: PostABidFormValues) {
    const lines = [
      `Bid title: ${values.title}`,
      `Duration: ${values.duration}`,
      `Budget: ${values.budget}`,
      `Token count: ${values.tokenCount || "Not provided"}`,
      "",
      "Requested assets:",
      `- Character: ${values.character}`,
      `- Persona: ${values.persona}`,
      `- Lorebook: ${values.lorebook}`,
      `- Background: ${values.background}`,
      `- Avatar: ${values.avatar}`,
      "",
      `Skills needed: ${values.skillsNeeded}`,
      `Price negotiable: ${values.isPriceNegotiable ? "Yes" : "No"}`,
      "",
      "Description:",
      values.description,
    ]

    const href = `mailto:support@character.market?subject=${encodeURIComponent(`Edit Bid: ${values.title}`)}&body=${encodeURIComponent(lines.join("\n"))}`
    window.location.href = href
    router.push("/post-a-bid")
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
