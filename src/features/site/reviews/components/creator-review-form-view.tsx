"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { Star } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { CreatorReviewRecord } from "@/features/reviews/types"
import { cn } from "@/lib/utils"

type CreatorReviewFormViewProps = {
  creator: {
    id: string
    name: string
    handle: string
    avatar: string
    tagline: string
  }
}

function StarPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (rating: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1
        const active = starValue <= value
        return (
          <button
            key={starValue}
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-transparent transition hover:border-border hover:bg-muted/50"
            onClick={() => onChange(starValue)}
            aria-label={`Rate ${starValue} star${starValue === 1 ? "" : "s"}`}
          >
            <Star
              className={cn(
                "size-5",
                active ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

export function CreatorReviewFormView({ creator }: CreatorReviewFormViewProps) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const canSubmit = rating > 0 && body.trim().length >= 12

  const ratingLabel = useMemo(() => {
    if (rating === 0) return "Select your rating"
    if (rating === 5) return "Excellent"
    if (rating >= 4) return "Great"
    if (rating >= 3) return "Good"
    if (rating >= 2) return "Needs improvement"
    return "Poor"
  }, [rating])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) {
      toast.error("Please add rating and detailed feedback.")
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/site/creators/${encodeURIComponent(creator.id)}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          title,
          body,
        }),
      })
      const json = (await response.json()) as { review?: CreatorReviewRecord; error?: string }
      if (!response.ok) {
        throw new Error(json.error || "Unable to submit review.")
      }
      setSubmitted(true)
      toast.success("Review submitted successfully.")
    } catch {
      toast.error("Unable to submit review.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
      <Card className="border-border/70">
        <CardHeader className="border-b pb-5">
          <div className="flex items-center gap-3">
            <Image
              src={creator.avatar}
              alt={creator.name}
              width={52}
              height={52}
              className="size-13 rounded-full object-cover"
            />
            <div>
              <CardTitle className="text-2xl tracking-tight">Write a review</CardTitle>
              <CardDescription className="mt-1">
                Share your experience with {creator.name} on Character Market.
              </CardDescription>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline">@{creator.handle}</Badge>
            <Badge variant="secondary">{creator.tagline}</Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {submitted ? (
            <div className="space-y-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-5">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Review published successfully.
              </p>
              <p className="text-sm text-muted-foreground">
                Your feedback is now visible on the creator profile and marketplace surfaces.
              </p>
              <div className="flex gap-2">
                <Link href={`/creators/${creator.id}`} className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
                  Back to profile
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Overall rating</label>
                <StarPicker value={rating} onChange={setRating} />
                <p className="text-xs text-muted-foreground">{ratingLabel}</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="review-title" className="text-sm font-medium text-foreground">
                  Headline (optional)
                </label>
                <Input
                  id="review-title"
                  placeholder="Great creator for long-form fantasy characters"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="review-body" className="text-sm font-medium text-foreground">
                  Your review
                </label>
                <Textarea
                  id="review-body"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="What stood out in communication, quality, delivery speed, and final output?"
                  className="min-h-32"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 12 characters. Be honest, specific, and helpful.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" disabled={isSubmitting || !canSubmit}>
                  {isSubmitting ? "Submitting..." : "Submit review"}
                </Button>
                <Link
                  href={`/creators/${creator.id}`}
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
