"use client"

import { useEffect, useMemo, useState } from "react"

import { calculateCreatorReviewAggregate } from "@/features/reviews/review-store"
import type { CreatorReviewRecord } from "@/features/reviews/types"

export function useCreatorReviews(creatorId: string) {
  const [reviews, setReviews] = useState<CreatorReviewRecord[]>([])

  useEffect(() => {
    if (!creatorId) {
      setReviews([])
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const response = await fetch(`/api/site/creators/${encodeURIComponent(creatorId)}/reviews`, {
          cache: "no-store",
        })
        const json = (await response.json()) as { reviews?: CreatorReviewRecord[]; error?: string }
        if (!response.ok) throw new Error(json.error || "Unable to load reviews.")
        if (!cancelled) {
          setReviews(Array.isArray(json.reviews) ? json.reviews : [])
        }
      } catch {
        if (!cancelled) setReviews([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [creatorId])

  return reviews
}

export function useCreatorReviewAggregate(params: {
  creatorId: string
  baseRating: number
  baseCount: number
}) {
  const reviews = useCreatorReviews(params.creatorId)
  return useMemo(
    () =>
      calculateCreatorReviewAggregate({
        baseRating: params.baseRating,
        baseCount: params.baseCount,
        localReviews: reviews,
      }),
    [params.baseCount, params.baseRating, reviews]
  )
}
