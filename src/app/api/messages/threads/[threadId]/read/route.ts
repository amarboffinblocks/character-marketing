import { NextResponse } from "next/server"

import { assertThreadParticipant, isAdminUser, markRead, requireAuthUser } from "@/app/api/messages/shared"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
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

    const adminRole = await isAdminUser(supabase, user)
    const client = adminRole ? createAdminSupabaseClient() : supabase

    if (!adminRole) {
      await assertThreadParticipant(supabase, normalizedThreadId, user.id)
    }

    const { data: messagesData, error: messagesError } = await client
      .from("conversation_messages")
      .select("id")
      .eq("thread_id", normalizedThreadId)
      .order("created_at", { ascending: false })
      .limit(1)

    if (messagesError) {
      return NextResponse.json({ error: "Unable to update read state.", details: messagesError.message }, { status: 400 })
    }

    const lastMessageId = messagesData?.[0]?.id as string | undefined
    await markRead(client, normalizedThreadId, user.id, lastMessageId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("MARK READ ERROR:", error)
    const message = error?.message || "Unable to update read state."
    const status = message === "Unauthorized" ? 401 : 400
    return NextResponse.json(
      { 
        error: message,
        success: false,
        debug: {
          threadId: (await context.params).threadId,
          timestamp: new Date().toISOString()
        }
      }, 
      { status }
    )
  }
}
