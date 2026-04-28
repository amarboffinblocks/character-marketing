import { NextResponse } from "next/server"

import { assertThreadParticipant, requireAuthUser } from "@/app/api/messages/shared"
import { createServerSupabaseClient } from "@/lib/supabase/server"

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function DELETE(request: Request, context: { params: Promise<{ threadId: string }> }) {
  try {
    const supabase = await createServerSupabaseClient()
    const user = await requireAuthUser(supabase)
    const { threadId } = await context.params
    const normalizedThreadId = asString(threadId)
    if (!normalizedThreadId) return NextResponse.json({ error: "threadId is required." }, { status: 400 })

    await assertThreadParticipant(supabase, normalizedThreadId, user.id)
    const mode = asString(new URL(request.url).searchParams.get("mode"))

    if (mode === "clear") {
      const [{ error: messagesError }, { error: readsError }] = await Promise.all([
        supabase.from("conversation_messages").delete().eq("thread_id", normalizedThreadId),
        supabase.from("conversation_reads").delete().eq("thread_id", normalizedThreadId),
      ])
      if (messagesError || readsError) {
        return NextResponse.json(
          {
            error: "Unable to clear chat.",
            details: messagesError?.message ?? readsError?.message,
          },
          { status: 400 }
        )
      }

      const { error: threadError } = await supabase
        .from("conversation_threads")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", normalizedThreadId)
      if (threadError) {
        return NextResponse.json({ error: "Unable to reset thread.", details: threadError.message }, { status: 400 })
      }
      return NextResponse.json({ success: true })
    }

    if (mode === "delete") {
      const { error } = await supabase.from("conversation_threads").delete().eq("id", normalizedThreadId)
      if (error) {
        return NextResponse.json({ error: "Unable to delete chat.", details: error.message }, { status: 400 })
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid mode. Use mode=clear or mode=delete." }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update chat."
    const status = message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
