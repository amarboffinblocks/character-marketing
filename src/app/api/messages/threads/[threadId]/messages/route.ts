import { NextResponse } from "next/server"

import {
  assertThreadParticipant,
  getMySenderRole,
  mapMessageRow,
  markRead,
  requireAuthUser,
} from "@/app/api/messages/shared"
import { createServerSupabaseClient } from "@/lib/supabase/server"

type SendMessagePayload = {
  text?: string
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function GET(_: Request, context: { params: Promise<{ threadId: string }> }) {
  try {
    const supabase = await createServerSupabaseClient()
    const user = await requireAuthUser(supabase)
    const { threadId } = await context.params
    const normalizedThreadId = asString(threadId)
    if (!normalizedThreadId) return NextResponse.json({ error: "threadId is required." }, { status: 400 })

    await assertThreadParticipant(supabase, normalizedThreadId, user.id)
    const { data, error } = await supabase
      .from("conversation_messages")
      .select("id, thread_id, sender_id, sender_role, body, created_at")
      .eq("thread_id", normalizedThreadId)
      .order("created_at", { ascending: true })

    if (error) return NextResponse.json({ error: "Unable to load messages.", details: error.message }, { status: 400 })
    const messages = (data ?? []).map((row) =>
      mapMessageRow(
        row as {
          id: string
          thread_id: string
          sender_id: string
          sender_role: "creator" | "buyer"
          body: string
          created_at: string
        }
      )
    )

    const lastMessageId = messages[messages.length - 1]?.id
    await markRead(supabase, normalizedThreadId, user.id, lastMessageId)
    return NextResponse.json({ messages })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load messages."
    const status = message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: Request, context: { params: Promise<{ threadId: string }> }) {
  try {
    const supabase = await createServerSupabaseClient()
    const user = await requireAuthUser(supabase)
    const { threadId } = await context.params
    const normalizedThreadId = asString(threadId)
    const body = (await request.json()) as SendMessagePayload
    const text = asString(body.text)

    if (!normalizedThreadId) return NextResponse.json({ error: "threadId is required." }, { status: 400 })
    if (!text) return NextResponse.json({ error: "Message text is required." }, { status: 400 })

    await assertThreadParticipant(supabase, normalizedThreadId, user.id)
    const senderRole = await getMySenderRole(supabase, user)

    const { data, error } = await supabase
      .from("conversation_messages")
      .insert({
        thread_id: normalizedThreadId,
        sender_id: user.id,
        sender_role: senderRole,
        body: text,
      })
      .select("id, thread_id, sender_id, sender_role, body, created_at")
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Unable to send message.", details: error?.message }, { status: 400 })
    }

    await markRead(supabase, normalizedThreadId, user.id, data.id)
    return NextResponse.json({
      message: mapMessageRow(
        data as {
          id: string
          thread_id: string
          sender_id: string
          sender_role: "creator" | "buyer"
          body: string
          created_at: string
        }
      ),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send message."
    const status = message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
