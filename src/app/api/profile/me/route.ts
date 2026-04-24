import { NextResponse } from "next/server"

import { isAuthRole, type AuthRole } from "@/lib/auth-roles"
import { createServerSupabaseClient } from "@/lib/supabase/server"

type ProfilePayload = {
  role?: AuthRole
  data?: Record<string, unknown>
}

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const roleParam = url.searchParams.get("role")?.trim().toLowerCase()
  if (!isAuthRole(roleParam)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const { data, error } = await supabase.from("profiles").select("role, profile_data").eq("id", user.id).maybeSingle()
  if (error) {
    return NextResponse.json(
      {
        error: "Unable to load profile",
        details: error.message,
        hint: "Run Supabase migrations for profiles/profile_data and retry.",
      },
      { status: 400 }
    )
  }

  const savedRole = data?.role
  const profileData = (data?.profile_data as Record<string, unknown> | null) ?? {}
  const selectedProfileData = (profileData[roleParam] as Record<string, unknown> | undefined) ?? null
  const fullName =
    (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "") ||
    (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "")
  const hydratedData =
    selectedProfileData && typeof selectedProfileData === "object"
      ? {
          ...selectedProfileData,
          email:
            typeof selectedProfileData.email === "string" && selectedProfileData.email.trim().length > 0
              ? selectedProfileData.email
              : user.email ?? "",
          displayName:
            typeof selectedProfileData.displayName === "string" && selectedProfileData.displayName.trim().length > 0
              ? selectedProfileData.displayName
              : fullName,
        }
      : {
          email: user.email ?? "",
          displayName: fullName,
        }

  return NextResponse.json({
    role: savedRole,
    data: hydratedData,
  })
}

export async function PUT(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as ProfilePayload
  const role = typeof body.role === "string" ? body.role.trim().toLowerCase() : body.role
  if (!isAuthRole(role) || !body.data || typeof body.data !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("role, profile_data")
    .eq("id", user.id)
    .maybeSingle()
  if (existingError) {
    return NextResponse.json(
      {
        error: "Unable to load existing profile",
        details: existingError.message,
        hint: "Run Supabase migrations for profiles/profile_data and retry.",
      },
      { status: 400 }
    )
  }

  const currentRole = existing?.role as AuthRole | null
  const currentProfileData = (existing?.profile_data as Record<string, unknown> | null) ?? {}

  const nextProfileData = {
    ...currentProfileData,
    [role]: body.data,
  }

  const persistedRole = currentRole ?? role
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      role: persistedRole,
      profile_data: nextProfileData,
    },
    { onConflict: "id" }
  )

  if (error) {
    return NextResponse.json(
      {
        error: "Unable to save profile",
        details: error.message,
        hint: "Check profiles table schema and RLS policies.",
      },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}
