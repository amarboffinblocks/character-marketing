import { NextResponse } from "next/server"

import { buildThreadsForUser, getMySenderRole, requireAuthUser } from "@/app/api/messages/shared"
import { createServerSupabaseClient } from "@/lib/supabase/server"

type OpenThreadPayload = {
  orderId?: string
  otherUserId?: string
  otherUserName?: string
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
    const threads = await buildThreadsForUser(supabase, user.id, orderId || undefined)
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
    const otherUserId = asString(body.otherUserId)
    const otherUserName = asString(body.otherUserName)

    if (!orderId) return NextResponse.json({ error: "orderId is required." }, { status: 400 })
    if (!otherUserId) return NextResponse.json({ error: "otherUserId is required." }, { status: 400 })
    if (otherUserId === user.id) {
      return NextResponse.json({ error: "otherUserId must be different from your user id." }, { status: 400 })
    }

    const myRole = await getMySenderRole(supabase, user)
    const creatorId = myRole === "creator" ? user.id : otherUserId
    const buyerId = myRole === "buyer" ? user.id : otherUserId
    const fullName =
      (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "") ||
      (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "")
    const creatorName = myRole === "creator" ? fullName : otherUserName
    const buyerName = myRole === "buyer" ? fullName : otherUserName

    const { data, error } = await supabase
      .from("conversation_threads")
      .upsert(
        {
          order_id: orderId,
          creator_id: creatorId,
          buyer_id: buyerId,
          creator_name: creatorName,
          buyer_name: buyerName,
        },
        { onConflict: "order_id" }
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
