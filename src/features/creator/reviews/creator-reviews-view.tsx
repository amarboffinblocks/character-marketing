"use client"

import { useEffect, useMemo, useState } from "react"
import { MessageSquareText, Pencil, RefreshCcw, Reply, Search, Star, Trash2, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreatorReviews } from "@/features/reviews/use-creator-reviews"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

type ReviewRating = 1 | 2 | 3 | 4 | 5
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

export function CreatorReviewsView({ creatorId }: { creatorId: string }) {
  const [fallbackCreatorId, setFallbackCreatorId] = useState("")
  const [search, setSearch] = useState("")
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all")
  const [replyFilter, setReplyFilter] = useState<ReplyFilter>("all")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const resolvedCreatorId = creatorId || fallbackCreatorId
  const submittedReviews = useCreatorReviews(resolvedCreatorId)

  useEffect(() => {
    const supabase = createClientSupabaseClient()
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.id) {
        if (!creatorId) {
          setFallbackCreatorId(user.id)
        }
        setCurrentUserId(user.id)
      }
    })()
  }, [creatorId])

  const metrics = useMemo(() => {
    const total = submittedReviews.length
    const average =
      total === 0
        ? 0
        : submittedReviews.reduce((acc, item) => acc + item.rating, 0) / total

    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star: star as ReviewRating,
      count: submittedReviews.filter((review) => review.rating === star).length,
      percentage:
        total === 0
          ? 0
          : Math.round((submittedReviews.filter((review) => review.rating === star).length / total) * 100),
    }))

    const repliedCount = submittedReviews.filter((review) => Boolean(review.creatorReply)).length
    const repliedRate = total === 0 ? 0 : Math.round((repliedCount / total) * 100)

    return {
      total,
      average: Math.round(average * 10) / 10,
      distribution,
      repliedRate,
    }
  }, [submittedReviews])

  const query = search.trim().toLowerCase()
  const filtered = submittedReviews.filter((review) => {
    const matchesSearch =
      query.length === 0 ||
      review.reviewerName.toLowerCase().includes(query) ||
      review.body.toLowerCase().includes(query) ||
      review.title.toLowerCase().includes(query)

    const matchesRating =
      ratingFilter === "all" ? true : review.rating === Number(ratingFilter)

    const matchesReply =
      replyFilter === "all"
        ? true
        : replyFilter === "replied"
          ? Boolean(review.creatorReply)
          : !review.creatorReply

    return matchesSearch && matchesRating && matchesReply
  })

  async function handleSubmitReply(reviewId: string, reply: string) {
    const response = await fetch(`/api/creator/reviews/${encodeURIComponent(reviewId)}/reply`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    })
    if (!response.ok) {
      const json = await response.json()
      throw new Error(json.error || "Failed to submit reply.")
    }
    window.location.reload()
  }

  async function handleDeleteReview() {
    if (!reviewToDelete) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const response = await fetch(`/api/site/reviews/${encodeURIComponent(reviewToDelete)}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const json = await response.json()
        throw new Error(json.error || "Failed to delete review.")
      }
      window.location.reload()
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Unable to delete review.")
      setIsDeleting(false)
    }
  }

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
              placeholder="Search reviews by buyer, headline, or comment"
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
            {submittedReviews.length === 0
              ? "No customer-submitted reviews yet."
              : "No reviews match your filters."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onSubmitReply={(reply) => handleSubmitReply(review.id, reply)}
              onDeleteReview={() => setReviewToDelete(review.id)}
            />
          ))}
        </div>
      )}

      <Dialog open={!!reviewToDelete} onOpenChange={(open) => !open && setReviewToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
            {deleteError && (
              <p className="mt-2 text-sm text-destructive">{deleteError}</p>
            )}
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setReviewToDelete(null)
                setDeleteError(null)
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteReview}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ReviewCard({
  review,
  currentUserId,
  onSubmitReply,
  onDeleteReview,
}: {
  review: {
    id: string
    reviewerId: string
    creatorId: string
    reviewerName: string
    reviewerInitials: string
    rating: number
    title: string
    body: string
    createdAt: string
    creatorReply?: string
  }
  currentUserId: string | null
  onSubmitReply: (reply: string) => Promise<void>
  onDeleteReview: () => Promise<void>
}) {
  const [replyDraft, setReplyDraft] = useState(review.creatorReply || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditingReply, setIsEditingReply] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const submittedAtLabel = new Date(review.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })

  const isReviewer = currentUserId === review.reviewerId
  const isCreator = currentUserId === review.creatorId
  const canDelete = isReviewer || isCreator
  const canEditReply = isCreator && review.creatorReply

  const handlePublish = async () => {
    if (!replyDraft.trim()) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmitReply(replyDraft.trim())
      setIsEditingReply(false)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to publish reply.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-start w-full   gap-3 border-b pb-4">
        <div className="flex items-start gap-3 flex-1 w-full ">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
            {review.reviewerInitials || initialsFromName(review.reviewerName)}
          </span>
          <div className="space-y-1 w-full ">
            <div className="flex w-full  items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{review.reviewerName}</p>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={onDeleteReview}
                  title="Delete review"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
            <RatingStars rating={review.rating as ReviewRating} />
            <p className="text-xs text-muted-foreground">
              Submitted on {submittedAtLabel}
            </p>
          </div>
        </div>
       
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <p className="text-sm px-2 text-foreground">{review.body}</p>

        {review.creatorReply && !isEditingReply ? (
          <div className="group flex justify-between items-start  relative rounded-lg border border-border/70 bg-muted/20 p-2">
            <p className=" text-sm text-muted-foreground">{review.creatorReply}</p>
            <div className="flex items-center justify-between">
              {canEditReply && (
                <div className="flex items-center ">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => setIsEditingReply(true)}
                    title="Edit reply"
                  >
                    <Pencil className="size-3.5 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 hover:text-destructive"
                    onClick={async () => {
                      setIsSubmitting(true)
                      setSubmitError(null)
                      try {
                        await onSubmitReply("")
                      } catch (err) {
                        setSubmitError(err instanceof Error ? err.message : "Error deleting reply")
                      } finally {
                        setIsSubmitting(false)
                      }
                    }}
                    title="Delete reply"
                    disabled={isSubmitting}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (isCreator || isEditingReply) && (
          <div className="space-y-2 rounded-lg border border-dashed border-border/80 bg-muted/10 p-3">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                {isEditingReply ? <Pencil className="size-3.5" /> : <MessageSquareText className="size-3.5" />}
                {isEditingReply ? "Edit your reply" : "Reply to this review"}
              </p>
              {isEditingReply && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => {
                    setIsEditingReply(false)
                    setReplyDraft(review.creatorReply || "")
                  }}
                >
                  <X className="size-3.5 text-muted-foreground" />
                </Button>
              )}
            </div>
            <Textarea
              value={replyDraft}
              onChange={(event) => setReplyDraft(event.target.value)}
              placeholder="Thank the buyer and add context where helpful..."
              className="min-h-20"
              disabled={isSubmitting}
            />
            {submitError && (
              <p className="text-xs text-destructive mt-1">{submitError}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                disabled={replyDraft.trim().length === 0 || isSubmitting}
                onClick={handlePublish}
              >
                {isSubmitting ? (
                  <RefreshCcw className="size-3.5 animate-spin" />
                ) : (
                  <Reply className="size-3.5" />
                )}
                {isEditingReply ? "Save changes" : "Publish reply"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
