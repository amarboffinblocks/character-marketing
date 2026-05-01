"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowRight, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCreatorReviews } from "@/features/reviews/use-creator-reviews"
import { createClientSupabaseClient } from "@/lib/supabase/client"

type ReviewsSummaryCardProps = {
  creatorId?: string
}

export function ReviewsSummaryCard({ creatorId }: ReviewsSummaryCardProps) {
  const [resolvedCreatorId, setResolvedCreatorId] = useState(creatorId ?? "")
  const localReviews = useCreatorReviews(resolvedCreatorId)

  useEffect(() => {
    if (creatorId) return
    const supabase = createClientSupabaseClient()
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.id) {
        setResolvedCreatorId(user.id)
      }
    })()
  }, [creatorId])

  const latestReview = localReviews[0]
  const average = useMemo(() => {
    if (localReviews.length === 0) return 0
    return localReviews.reduce((sum, review) => sum + review.rating, 0) / localReviews.length
  }, [localReviews])

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>Recent reviews</CardTitle>
            <CardDescription>Fresh customer feedback from your profile</CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            {localReviews.length} new
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {latestReview ? (
          <>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-foreground">{average.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">avg from local reviews</span>
            </div>
            <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{latestReview.reviewerName}</p>
                <p className="text-xs text-muted-foreground">{new Date(latestReview.createdAt).toLocaleDateString()}</p>
              </div>
              {latestReview.title ? (
                <p className="mt-1 text-sm text-foreground">{latestReview.title}</p>
              ) : null}
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{latestReview.body}</p>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No new reviews yet. Reviews will appear here after customers submit them.</p>
        )}

        <Link href="/dashboard/creator/reviews" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          Open reviews
          <ArrowRight className="size-3.5" />
        </Link>
      </CardContent>
    </Card>
  )
}
