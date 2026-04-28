import { NextResponse } from "next/server"

import { assertThreadParticipant, markRead, requireAuthUser } from "@/app/api/messages/shared"
import { createServerSupabaseClient } from "@/lib/supabase/server"

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function POST(_: Request, context: { params: Promise<{ threadId: string }> }) {
  try {
    const supabase = await createServerSupabaseClient()
    const user = await requireAuthUser(supabase)
    const { threadId } = await context.params
    const normalizedThreadId = asString(threadId)
    if (!normalizedThreadId) return NextResponse.json({ error: "threadId is required." }, { status: 400 })

    await assertThreadParticipant(supabase, normalizedThreadId, user.id)

    const { data: messagesData, error: messagesError } = await supabase
      .from("conversation_messages")
      .select("id")
      .eq("thread_id", normalizedThreadId)
      .order("created_at", { ascending: false })
      .limit(1)

    if (messagesError) {
      return NextResponse.json({ error: "Unable to update read state.", details: messagesError.message }, { status: 400 })
    }

    const lastMessageId = messagesData?.[0]?.id as string | undefined
    await markRead(supabase, normalizedThreadId, user.id, lastMessageId)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update read state."
    const status = message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
