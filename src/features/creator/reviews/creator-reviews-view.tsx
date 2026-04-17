"use client"

import { useState } from "react"
import { MessageSquareText, Reply, Search, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  creatorReviews,
  getReviewMetrics,
  type CreatorReview,
  type ReviewRating,
} from "@/features/creator/reviews/reviews-data"
import { cn } from "@/lib/utils"

type RatingFilter = "all" | "5" | "4" | "3" | "2" | "1"
type ReplyFilter = "all" | "replied" | "unreplied"

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function RatingStars({ rating, size = "sm" }: { rating: ReviewRating; size?: "sm" | "md" }) {
  const starSize = size === "md" ? "size-4" : "size-3.5"
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={cn(
            starSize,
            value <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
          )}
        />
      ))}
    </div>
  )
}

export function CreatorReviewsView() {
  const [search, setSearch] = useState("")
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all")
  const [replyFilter, setReplyFilter] = useState<ReplyFilter>("all")

  const metrics = getReviewMetrics(creatorReviews)

  const query = search.trim().toLowerCase()
  const filtered = creatorReviews.filter((review) => {
    const matchesSearch =
      query.length === 0 ||
      review.buyerName.toLowerCase().includes(query) ||
      review.comment.toLowerCase().includes(query) ||
      review.packageName.toLowerCase().includes(query) ||
      review.orderId.toLowerCase().includes(query)

    const matchesRating =
      ratingFilter === "all" ? true : review.rating === Number(ratingFilter)

    const matchesReply =
      replyFilter === "all"
        ? true
        : replyFilter === "replied"
          ? Boolean(review.reply)
          : !review.reply

    return matchesSearch && matchesRating && matchesReply
  })

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Star className="size-5" />
          </span>
          <div className="space-y-1.5">
            <Badge variant="secondary" className="w-fit">Reputation</Badge>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Reviews
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Track buyer feedback, quality signals, and reply performance across orders.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_1.5fr]">
        <Card>
          <CardHeader>
            <CardTitle>Overall rating</CardTitle>
            <CardDescription>Average score based on {metrics.total} reviews.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div>
              <p className="text-5xl font-semibold tracking-tight text-foreground">
                {metrics.average.toFixed(1)}
              </p>
              <RatingStars rating={Math.round(metrics.average) as ReviewRating} size="md" />
              <p className="mt-1 text-xs text-muted-foreground">{metrics.total} total reviews</p>
            </div>

            <div className="flex-1 space-y-2">
              {metrics.distribution.map((row) => (
                <div key={row.star} className="flex items-center gap-2 text-xs">
                  <span className="inline-flex w-8 items-center gap-1 font-medium text-foreground">
                    {row.star}
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${row.percentage}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-muted-foreground">{row.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card size="sm">
            <CardHeader className="pb-2">
              <CardDescription>Reply rate</CardDescription>
              <CardTitle className="text-2xl">{metrics.repliedRate}%</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Replies build trust and improve ranking.
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader className="pb-2">
              <CardDescription>5-star share</CardDescription>
              <CardTitle className="text-2xl">{metrics.distribution[0].percentage}%</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {metrics.distribution[0].count} reviews with top rating
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader className="pb-2">
              <CardDescription>Negative reviews</CardDescription>
              <CardTitle className="text-2xl">
                {metrics.distribution[3].count + metrics.distribution[4].count}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Monitor and respond to improve reputation.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-3 sm:p-4">
        <div className="grid gap-3 md:grid-cols-[1.6fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reviews by buyer, comment, package, or order"
              className="pl-8"
            />
          </div>
          <Select value={ratingFilter} onValueChange={(value) => setRatingFilter(value as RatingFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ratings</SelectItem>
              <SelectItem value="5">5 stars</SelectItem>
              <SelectItem value="4">4 stars</SelectItem>
              <SelectItem value="3">3 stars</SelectItem>
              <SelectItem value="2">2 stars</SelectItem>
              <SelectItem value="1">1 star</SelectItem>
            </SelectContent>
          </Select>
          <Select value={replyFilter} onValueChange={(value) => setReplyFilter(value as ReplyFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Reply status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All reviews</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="unreplied">Needs reply</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No reviews match your filters.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  )
}

function ReviewCard({ review }: { review: CreatorReview }) {
  const [replyDraft, setReplyDraft] = useState("")
  const [submittedReply, setSubmittedReply] = useState(review.reply ?? "")

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 border-b pb-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
            {initialsFromName(review.buyerName)}
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">{review.buyerName}</p>
              <Badge variant="outline" className="h-5 text-[10px]">{review.orderId}</Badge>
            </div>
            <RatingStars rating={review.rating} />
            <p className="text-xs text-muted-foreground">
              {review.packageName} · {review.submittedAt}
            </p>
          </div>
        </div>
        {submittedReply ? (
          <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            Replied
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-300">
            Needs reply
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3 py-4">
        <p className="text-sm text-foreground">{review.comment}</p>
        {review.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {review.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="h-5 text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        {submittedReply ? (
          <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <Reply className="size-3.5" />
              Your reply
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{submittedReply}</p>
          </div>
        ) : (
          <div className="space-y-2 rounded-lg border border-dashed border-border/80 bg-muted/10 p-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <MessageSquareText className="size-3.5" />
              Reply to this review
            </p>
            <Textarea
              value={replyDraft}
              onChange={(event) => setReplyDraft(event.target.value)}
              placeholder="Thank the buyer and add context where helpful..."
              className="min-h-20"
            />
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                disabled={replyDraft.trim().length === 0}
                onClick={() => {
                  setSubmittedReply(replyDraft.trim())
                  setReplyDraft("")
                }}
              >
                <Reply className="size-3.5" />
                Publish reply
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
