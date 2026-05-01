"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoveLeft } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { PostABidForm, type PostABidFormValues } from "@/features/site/bids/components/post-a-bid-form"
import { cn } from "@/lib/utils"

export default function NewPostABidPage() {
  const router = useRouter()

  async function handleSubmit(values: PostABidFormValues) {
    const response = await fetch("/api/site/bids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
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

      <PostABidForm submitLabel="Publish" onCancel={() => router.push("/post-a-bid")} onSubmit={handleSubmit} />
    </main>
  )
}
