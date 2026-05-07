import { NextResponse } from "next/server"

import {
  buildThreadsForUser,
  buildThreadsForAdmin,
  getMySenderRole,
  isAdminUser,
  requireAuthUser,
  resolveAvatarUrlByUserId,
  resolveAvatarUrlForUser,
} from "@/app/api/messages/shared"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"

type OpenThreadPayload = {
  orderId?: string
  otherUserId?: string
  otherUserName?: string
  creatorId?: string
  buyerId?: string
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const user = await requireAuthUser(supabase)
    const url = new URL(request.url)
    const orderId = asString(url.searchParams.get("orderId"))
    const threads = (await isAdminUser(supabase, user))
      ? await buildThreadsForAdmin(user.id, orderId || undefined)
      : await buildThreadsForUser(supabase, user.id, orderId || undefined)
    return NextResponse.json({ threads })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load message threads."
    const status = message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const user = await requireAuthUser(supabase)
    const body = (await request.json()) as OpenThreadPayload
    const orderId = asString(body.orderId)
    const creatorIdFromBody = asString(body.creatorId)
    const buyerIdFromBody = asString(body.buyerId)
    const otherUserId = asString(body.otherUserId)
    const otherUserName = asString(body.otherUserName)
    const adminRole = await isAdminUser(supabase, user)

    if (!orderId) return NextResponse.json({ error: "orderId is required." }, { status: 400 })
    if (!adminRole && !otherUserId) return NextResponse.json({ error: "otherUserId is required." }, { status: 400 })
    if (!adminRole && otherUserId === user.id) {
      return NextResponse.json({ error: "otherUserId must be different from your user id." }, { status: 400 })
    }

    if (adminRole) {
      const adminSupabase = createAdminSupabaseClient()
      const targetId = otherUserId
      
      let creatorId = creatorIdFromBody
      let buyerId = buyerIdFromBody

      if (!creatorId || !buyerId) {
        const { data: orderRecord, error: orderError } = await adminSupabase
          .from("orders")
          .select("creator_id,buyer_id")
          .eq("id", orderId)
          .maybeSingle()
        if (orderError || !orderRecord) {
          return NextResponse.json({ error: "Unable to resolve order participants." }, { status: 400 })
        }
        creatorId = asString(orderRecord.creator_id)
        buyerId = asString(orderRecord.buyer_id)
      }

      if (!creatorId || !buyerId) {
        return NextResponse.json({ error: "creatorId and buyerId are required." }, { status: 400 })
      }

      // If a targetId is provided, the admin is starting a private chat with THAT user.
      // We'll set the participants as (Admin, Target).
      // Otherwise, we use the default (Creator, Buyer) thread which the admin also oversees.
      let finalCreatorId = creatorId
      let finalBuyerId = buyerId
      let finalCreatorName = "Creator"
      let finalBuyerName = "Buyer"

      if (targetId) {
        if (targetId === creatorId) {
          finalCreatorId = user.id
          finalBuyerId = creatorId
          finalCreatorName = "Admin"
          finalBuyerName = "Creator"
        } else if (targetId === buyerId) {
          finalCreatorId = user.id
          finalBuyerId = buyerId
          finalCreatorName = "Admin"
          finalBuyerName = "Buyer"
        }
      }

      const [creatorAvatarUrl, buyerAvatarUrl] = await Promise.all([
        resolveAvatarUrlByUserId(adminSupabase, finalCreatorId),
        resolveAvatarUrlByUserId(adminSupabase, finalBuyerId),
      ])

      const { data: existingThread } = await adminSupabase
        .from("conversation_threads")
        .select("creator_name, buyer_name")
        .eq("order_id", orderId)
        .eq("creator_id", finalCreatorId)
        .eq("buyer_id", finalBuyerId)
        .maybeSingle()

      const { data: threadData, error: threadError } = await adminSupabase
        .from("conversation_threads")
        .upsert(
          {
            order_id: orderId,
            creator_id: finalCreatorId,
            buyer_id: finalBuyerId,
            creator_name: (existingThread?.creator_name as string | undefined) || finalCreatorName,
            buyer_name: (existingThread?.buyer_name as string | undefined) || finalBuyerName,
            creator_avatar_url: creatorAvatarUrl,
            buyer_avatar_url: buyerAvatarUrl,
          },
          { onConflict: "order_id,creator_id,buyer_id" }
        )
        .select("id")
        .single()

      if (threadError || !threadData) {
        return NextResponse.json({ error: "Unable to open thread.", details: threadError?.message }, { status: 400 })
      }

      const threads = await buildThreadsForAdmin(user.id, orderId)
      const thread = threads.find((item) => item.id === threadData.id)
      if (!thread) return NextResponse.json({ error: "Unable to load created thread." }, { status: 400 })

      return NextResponse.json({ thread }, { status: 201 })
    }

    const myRole = await getMySenderRole(supabase, user)
    const creatorId = myRole === "creator" ? user.id : otherUserId
    const buyerId = myRole === "buyer" ? user.id : otherUserId
    const fullName =
      (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "") ||
      (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "")
    const myAvatarUrl = await resolveAvatarUrlForUser(supabase, user)
    const creatorName = myRole === "creator" ? fullName : otherUserName
    const buyerName = myRole === "buyer" ? fullName : otherUserName

    const { data: existingThread } = await supabase
      .from("conversation_threads")
      .select("creator_name, buyer_name, creator_avatar_url, buyer_avatar_url")
      .eq("order_id", orderId)
      .maybeSingle()

    const otherAvatarUrl = await resolveAvatarUrlByUserId(supabase, otherUserId)
    const creatorAvatarUrl =
      myRole === "creator"
        ? myAvatarUrl
        : ((existingThread?.creator_avatar_url as string | undefined) ?? otherAvatarUrl ?? "")
    const buyerAvatarUrl =
      myRole === "buyer"
        ? myAvatarUrl
        : ((existingThread?.buyer_avatar_url as string | undefined) ?? otherAvatarUrl ?? "")

    const { data, error } = await supabase
      .from("conversation_threads")
      .upsert(
        {
          order_id: orderId,
          creator_id: creatorId,
          buyer_id: buyerId,
          creator_name: creatorName || (existingThread?.creator_name as string | undefined) || "Creator",
          buyer_name: buyerName || (existingThread?.buyer_name as string | undefined) || "Buyer",
          creator_avatar_url: creatorAvatarUrl,
          buyer_avatar_url: buyerAvatarUrl,
        },
        { onConflict: "order_id,creator_id,buyer_id" }
      )
      .select("id")
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Unable to open thread.", details: error?.message }, { status: 400 })
    }

    const threads = await buildThreadsForUser(supabase, user.id, orderId)
    const thread = threads.find((item) => item.id === data.id)
    if (!thread) return NextResponse.json({ error: "Unable to load created thread." }, { status: 400 })

    return NextResponse.json({ thread }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to open thread."
    const status = message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
