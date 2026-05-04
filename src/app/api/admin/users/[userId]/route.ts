import { NextResponse } from "next/server"

import { resolvePersistedRole } from "@/lib/profile-role"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"

type RouteProps = {
  params: Promise<{ userId: string }>
}

async function ensureAdmin() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  const role = await resolvePersistedRole(supabase, user)
  if (role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }

  return { userId: user.id }
}

export async function DELETE(_: Request, { params }: RouteProps) {
  const auth = await ensureAdmin()
  if ("error" in auth) return auth.error

  const { userId } = await params
  const targetUserId = userId.trim()

  if (!targetUserId) {
    return NextResponse.json({ error: "User id is required." }, { status: 400 })
  }
  if (targetUserId === auth.userId) {
    return NextResponse.json({ error: "You cannot delete your own admin profile." }, { status: 400 })
  }

  const adminSupabase = createAdminSupabaseClient()
  const { error } = await adminSupabase.from("profiles").delete().eq("id", targetUserId)

  if (error) {
    return NextResponse.json(
      { error: "Unable to delete user.", details: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const auth = await ensureAdmin()
  if ("error" in auth) return auth.error

  const { userId } = await params
  const targetUserId = userId.trim()
  if (!targetUserId) {
    return NextResponse.json({ error: "User id is required." }, { status: 400 })
  }
  if (targetUserId === auth.userId) {
    return NextResponse.json({ error: "You cannot deactivate your own admin profile." }, { status: 400 })
  }

  const payload = (await request.json().catch(() => ({}))) as { action?: string }
  if (payload.action !== "deactivate" && payload.action !== "activate") {
    return NextResponse.json({ error: "Unsupported action." }, { status: 400 })
  }

  const adminSupabase = createAdminSupabaseClient()
  const { data: current, error: currentError } = await adminSupabase
    .from("profiles")
    .select("profile_data")
    .eq("id", targetUserId)
    .maybeSingle<{ profile_data: Record<string, unknown> | null }>()

  if (currentError) {
    return NextResponse.json({ error: "Unable to load user profile.", details: currentError.message }, { status: 400 })
  }

  const profileData = (current?.profile_data as Record<string, unknown> | null) ?? {}
  const userNode =
    profileData.user && typeof profileData.user === "object"
      ? ({ ...(profileData.user as Record<string, unknown>) } as Record<string, unknown>)
      : ({ ...profileData } as Record<string, unknown>)
  const flagsRaw = Array.isArray(userNode.flags) ? userNode.flags : []
  const existingFlags = flagsRaw.filter((item): item is string => typeof item === "string")
  const flags =
    payload.action === "deactivate"
      ? Array.from(new Set(existingFlags.concat("suspended")))
      : existingFlags.filter((flag) => flag !== "suspended")
  userNode.flags = flags
  userNode.status = payload.action === "deactivate" ? "suspended" : "active"

  const nextProfileData =
    profileData.user && typeof profileData.user === "object"
      ? { ...profileData, user: userNode }
      : { ...profileData, ...userNode }

  const { error } = await adminSupabase
    .from("profiles")
    .update({ profile_data: nextProfileData })
    .eq("id", targetUserId)

  if (error) {
    return NextResponse.json({ error: `Unable to ${payload.action} user.`, details: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
