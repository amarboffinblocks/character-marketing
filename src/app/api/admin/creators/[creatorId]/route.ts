import { NextResponse } from "next/server"

import { resolvePersistedRole } from "@/lib/profile-role"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"

type RouteProps = {
  params: Promise<{ creatorId: string }>
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

  const { creatorId } = await params
  const targetCreatorId = creatorId.trim()

  if (!targetCreatorId) {
    return NextResponse.json({ error: "Creator id is required." }, { status: 400 })
  }
  if (targetCreatorId === auth.userId) {
    return NextResponse.json({ error: "You cannot delete your own creator profile." }, { status: 400 })
  }

  const adminSupabase = createAdminSupabaseClient()
  const { data: profile, error: profileError } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", targetCreatorId)
    .maybeSingle<{ role: string | null }>()

  if (profileError) {
    return NextResponse.json(
      { error: "Unable to validate creator profile.", details: profileError.message },
      { status: 400 }
    )
  }
  if (!profile || profile.role !== "creator") {
    return NextResponse.json({ error: "Creator profile not found." }, { status: 404 })
  }

  const { error } = await adminSupabase.from("profiles").delete().eq("id", targetCreatorId)
  if (error) {
    return NextResponse.json(
      { error: "Unable to delete creator.", details: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const auth = await ensureAdmin()
  if ("error" in auth) return auth.error

  const { creatorId } = await params
  const targetCreatorId = creatorId.trim()
  if (!targetCreatorId) {
    return NextResponse.json({ error: "Creator id is required." }, { status: 400 })
  }
  if (targetCreatorId === auth.userId) {
    return NextResponse.json({ error: "You cannot deactivate your own creator profile." }, { status: 400 })
  }

  const payload = (await request.json().catch(() => ({}))) as { action?: string }
  if (payload.action !== "deactivate" && payload.action !== "activate") {
    return NextResponse.json({ error: "Unsupported action." }, { status: 400 })
  }

  const adminSupabase = createAdminSupabaseClient()
  const { data: current, error: currentError } = await adminSupabase
    .from("profiles")
    .select("role, profile_data")
    .eq("id", targetCreatorId)
    .maybeSingle<{ role: string | null; profile_data: Record<string, unknown> | null }>()

  if (currentError) {
    return NextResponse.json({ error: "Unable to load creator profile.", details: currentError.message }, { status: 400 })
  }
  if (!current || current.role !== "creator") {
    return NextResponse.json({ error: "Creator profile not found." }, { status: 404 })
  }

  const profileData = current.profile_data ?? {}
  const creatorNode =
    profileData.creator && typeof profileData.creator === "object"
      ? ({ ...(profileData.creator as Record<string, unknown>) } as Record<string, unknown>)
      : {}
  const flagsRaw = Array.isArray(creatorNode.flags) ? creatorNode.flags : []
  const existingFlags = flagsRaw.filter((item): item is string => typeof item === "string")
  const flags =
    payload.action === "deactivate"
      ? Array.from(new Set(existingFlags.concat("suspended")))
      : existingFlags.filter((flag) => flag !== "suspended")
  creatorNode.flags = flags
  creatorNode.status = payload.action === "deactivate" ? "suspended" : "active"
  creatorNode.isAvailable = payload.action === "activate"

  const nextProfileData = { ...profileData, creator: creatorNode }
  const { error } = await adminSupabase
    .from("profiles")
    .update({ profile_data: nextProfileData })
    .eq("id", targetCreatorId)

  if (error) {
    return NextResponse.json({ error: `Unable to ${payload.action} creator.`, details: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
