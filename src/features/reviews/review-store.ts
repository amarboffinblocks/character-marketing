import type {
  CreateCreatorReviewInput,
  CreatorReviewAggregate,
  CreatorReviewRecord,
} from "@/features/reviews/types"

const STORAGE_KEY = "character-market:creator-reviews:v1"
const REVIEW_UPDATED_EVENT = "cm:reviews:updated"

function toInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function normalizeRating(value: number) {
  if (!Number.isFinite(value)) return 5
  return Math.max(1, Math.min(5, Math.round(value)))
}

function readRaw(): CreatorReviewRecord[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is CreatorReviewRecord => Boolean(item && typeof item === "object"))
  } catch {
    return []
  }
}

function writeRaw(items: CreatorReviewRecord[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event(REVIEW_UPDATED_EVENT))
}

export function getCreatorReviews(creatorId: string): CreatorReviewRecord[] {
  return readRaw()
    .filter((item) => item.creatorId === creatorId && item.status === "published")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function createCreatorReview(input: CreateCreatorReviewInput): CreatorReviewRecord {
  const nextRecord: CreatorReviewRecord = {
    id: `review-${crypto.randomUUID()}`,
    creatorId: input.creatorId,
    reviewerName: input.reviewerName.trim() || "Buyer",
    reviewerAvatar: input.reviewerAvatar ?? null,
    reviewerInitials: toInitials(input.reviewerName || "Buyer"),
    rating: normalizeRating(input.rating),
    title: (input.title ?? "").trim(),
    body: input.body.trim(),
    createdAt: new Date().toISOString(),
    status: "published",
  }
  const current = readRaw()
  writeRaw([nextRecord, ...current])
  return nextRecord
}

export function calculateCreatorReviewAggregate(params: {
  baseRating: number
  baseCount: number
  localReviews: CreatorReviewRecord[]
}): CreatorReviewAggregate {
  const localCount = params.localReviews.length
  const localTotal = params.localReviews.reduce((sum, review) => sum + review.rating, 0)
  const baseTotal = params.baseRating * params.baseCount
  const reviewCount = params.baseCount + localCount
  if (reviewCount === 0) {
    return { averageRating: 0, reviewCount: 0 }
  }
  return {
    averageRating: Number(((baseTotal + localTotal) / reviewCount).toFixed(1)),
    reviewCount,
  }
}

export function getReviewStoreUpdateEventName() {
  return REVIEW_UPDATED_EVENT
}
