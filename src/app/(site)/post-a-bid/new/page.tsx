"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoveLeft } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { PostABidForm, type PostABidFormValues } from "@/features/site/bids/components/post-a-bid-form"
import { cn } from "@/lib/utils"

export default function NewPostABidPage() {
  const router = useRouter()

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

    const href = `mailto:support@character.market?subject=${encodeURIComponent(`Post a Bid: ${values.title}`)}&body=${encodeURIComponent(lines.join("\n"))}`
    window.location.href = href
    router.push("/post-a-bid")
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-24 pb-8 sm:px-6 lg:px-8">
      <Link href="/post-a-bid" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit")}>
        <MoveLeft className="size-4" />
        Back to bids
      </Link>

      <PostABidForm submitLabel="Publish" onCancel={() => router.push("/post-a-bid")} onSubmit={handleSubmit} />
    </main>
  )
}
