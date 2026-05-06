import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const isGlobal = searchParams.get("global") === "true"

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signOut({
    scope: isGlobal ? "global" : "local",
  })

  if (error) {
    return NextResponse.json({ error: "Unable to sign out." }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
