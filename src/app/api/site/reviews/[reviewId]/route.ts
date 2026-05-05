import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const supabase = await createServerSupabaseClient()
  const { reviewId } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // The RLS policy allows:
  // 1. The original reviewer to delete their review.
  // 2. The creator (profile owner) to delete any review on their profile.
  const { error } = await supabase
    .from("creator_reviews")
    .delete()
    .eq("id", reviewId)

  if (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
