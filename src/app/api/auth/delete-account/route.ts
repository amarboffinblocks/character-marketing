import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let json: any
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (json.confirmation !== "delete my account") {
    return NextResponse.json({ error: "Invalid confirmation text" }, { status: 400 })
  }

  const adminClient = createAdminSupabaseClient()

  // Deleting from Supabase Auth will trigger cascade deletes in the public schema
  // (Prisma references should also be set to Cascade)
  const { error } = await adminClient.auth.admin.deleteUser(user.id)

  if (error) {
    console.error("[Delete Account] Error:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }

  // Also sign out the current user session
  await supabase.auth.signOut()

  return NextResponse.json({ success: true, message: "Account deleted permanently" })
}
