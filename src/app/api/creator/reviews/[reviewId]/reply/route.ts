import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const supabase = await createServerSupabaseClient()
  const { reviewId } = await params
  const { reply } = await request.json()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (typeof reply !== "string") {
    return NextResponse.json({ error: "Reply text is required." }, { status: 400 } )
  }

  // Update the review with the reply.
  // RLS creator_update_own allows this if the current user is the creator_id.
  const { error } = await supabase
    .from("creator_reviews")
    .update({
      creator_reply: reply.trim() || null,
      creator_replied_at: reply.trim() ? new Date().toISOString() : null,
    })
    .eq("id", reviewId)

  if (error) {
    console.error("Error updating reply:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
