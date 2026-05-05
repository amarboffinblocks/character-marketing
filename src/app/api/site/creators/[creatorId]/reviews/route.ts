import { NextResponse } from "next/server"
import { z } from "zod"

import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { getOrdersDbClient } from "@/lib/order-deliveries"
import { insertInboxNotification } from "@/lib/inbox-notifications"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(12).max(4000),
  orderId: z.string().uuid().optional(),
})

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function reviewerSummary(profileData: unknown, fallbackName: string) {
  const root = profileData && typeof profileData === "object" ? (profileData as Record<string, unknown>) : null
  const user = root?.user && typeof root.user === "object" ? (root.user as Record<string, unknown>) : null
  const displayName =
    (typeof user?.displayName === "string" && user.displayName.trim()) ||
    (typeof root?.displayName === "string" && root.displayName.trim()) ||
    fallbackName ||
    "Buyer"
  const avatarUrl =
    (typeof user?.avatarUrl === "string" && user.avatarUrl.trim()) ||
    (typeof root?.avatarUrl === "string" && root.avatarUrl.trim()) ||
    ""
  return {
    reviewerName: displayName,
    reviewerAvatar: avatarUrl || null,
    reviewerInitials: displayName
      .split(/\s+/)
      .map((part) => part.slice(0, 1))
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  }
}

export async function GET(_: Request, context: { params: Promise<{ creatorId: string }> }) {
  const { creatorId } = await context.params
  const normalizedCreatorId = asString(creatorId)
  if (!normalizedCreatorId) {
    return NextResponse.json({ error: "creatorId is required." }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()
  const { data: reviews, error } = await admin
    .from("creator_reviews")
    .select("id,creator_id,reviewer_id,order_id,rating,title,body,status,created_at,creator_reply,creator_replied_at")
    .eq("creator_id", normalizedCreatorId)
    .eq("status", "published")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const reviewerIds = Array.from(
    new Set((reviews ?? []).map((review) => asString((review as Record<string, unknown>).reviewer_id)).filter(Boolean))
  )
  let profileMap = new Map<string, unknown>()
  if (reviewerIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, profile_data")
      .in("id", reviewerIds)
    profileMap = new Map(
      (profiles ?? []).map((profile) => [
        asString((profile as Record<string, unknown>).id),
        (profile as Record<string, unknown>).profile_data ?? null,
      ])
    )
  }

  const mapped = (reviews ?? []).map((review) => {
    const record = review as Record<string, unknown>
    const reviewerId = asString(record.reviewer_id)
    const summary = reviewerSummary(profileMap.get(reviewerId), "Buyer")
    return {
      id: asString(record.id),
      creatorId: asString(record.creator_id),
      orderId: asString(record.order_id),
      reviewerId,
      rating: Number(record.rating ?? 0),
      title: asString(record.title),
      body: asString(record.body),
      status: asString(record.status) || "published",
      createdAt: asString(record.created_at),
      creatorReply: asString(record.creator_reply) || undefined,
      creatorRepliedAt: asString(record.creator_replied_at) || undefined,
      ...summary,
    }
  })

  return NextResponse.json({ reviews: mapped })
}

export async function POST(request: Request, context: { params: Promise<{ creatorId: string }> }) {
  const { creatorId } = await context.params
  const normalizedCreatorId = asString(creatorId)
  if (!normalizedCreatorId) {
    return NextResponse.json({ error: "creatorId is required." }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }
  if (user.id === normalizedCreatorId) {
    return NextResponse.json({ error: "You cannot review your own creator profile." }, { status: 400 })
  }

  const body = await request.json()
  const parsed = createReviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()
  if (parsed.data.orderId) {
    const { data: orderRecord, error: orderError } = await admin
      .from("orders")
      .select("id,buyer_id,creator_id,status")
      .eq("id", parsed.data.orderId)
      .eq("buyer_id", user.id)
      .eq("creator_id", normalizedCreatorId)
      .maybeSingle()

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 400 })
    }
    const order = orderRecord as Record<string, unknown> | null
    if (!order) {
      return NextResponse.json({ error: "Order not found for review." }, { status: 400 })
    }
    const status = asString(order.status)
    if (status !== "completed" && status !== "approved") {
      return NextResponse.json({ error: "You can review only approved orders." }, { status: 400 })
    }

    const { data: existingReview } = await admin
      .from("creator_reviews")
      .select("id")
      .eq("order_id", parsed.data.orderId)
      .eq("reviewer_id", user.id)
      .maybeSingle()

    if (existingReview) {
      return NextResponse.json({ error: "You already reviewed this order." }, { status: 400 })
    }
  }

  const { data: inserted, error } = await admin
    .from("creator_reviews")
    .insert({
      creator_id: normalizedCreatorId,
      reviewer_id: user.id,
      order_id: parsed.data.orderId ?? null,
      rating: parsed.data.rating,
      title: parsed.data.title ?? "",
      body: parsed.data.body,
      status: "published",
    })
    .select("id,creator_id,reviewer_id,order_id,rating,title,body,status,created_at")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const fallbackName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()) ||
    (typeof user.email === "string" ? user.email.split("@")[0] : "Buyer")
  const summary = reviewerSummary(null, fallbackName)

  const record = (inserted ?? {}) as Record<string, unknown>
  const notificationClient = getOrdersDbClient()
  try {
    await notificationClient.connect()
    await insertInboxNotification(notificationClient, {
      userId: normalizedCreatorId,
      category: "review",
      title: "New review received",
      body: `A buyer left a ${String(record.rating ?? parsed.data.rating)}-star review on your profile.`,
      actionUrl: "/dashboard/creator/reviews",
    })
  } finally {
    await notificationClient.end().catch(() => {})
  }
  return NextResponse.json({
    review: {
      id: asString(record.id),
      creatorId: asString(record.creator_id),
      orderId: asString(record.order_id),
      reviewerId: asString(record.reviewer_id),
      rating: Number(record.rating ?? 0),
      title: asString(record.title),
      body: asString(record.body),
      status: asString(record.status) || "published",
      createdAt: asString(record.created_at),
      ...summary,
    },
  })
}
