import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("profile_data")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const profileData = (data?.profile_data as Record<string, unknown> | null) ?? {}
  const userData = (profileData.user as Record<string, unknown> | undefined) ?? {}
  const savedCreators = Array.isArray(userData.savedCreators) ? userData.savedCreators : []

  return NextResponse.json({ savedCreators })
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { creatorId } = await request.json()
    if (typeof creatorId !== "string" || !creatorId) {
      return NextResponse.json({ error: "Invalid creatorId" }, { status: 400 })
    }

    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("role, profile_data")
      .eq("id", user.id)
      .maybeSingle()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 })
    }

    const currentRole = data?.role ?? "user"
    const currentProfileData = (data?.profile_data as Record<string, unknown> | null) ?? {}
    const userData = (currentProfileData.user as Record<string, unknown> | undefined) ?? {}
    const savedCreators = Array.isArray(userData.savedCreators) ? [...userData.savedCreators] : []

    if (!savedCreators.includes(creatorId)) {
      savedCreators.push(creatorId)
    }

    const nextProfileData = {
      ...currentProfileData,
      user: {
        ...userData,
        savedCreators,
      },
    }

    const { error: saveError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        role: currentRole,
        profile_data: nextProfileData,
      },
      { onConflict: "id" }
    )

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, savedCreators })
  } catch {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { creatorId } = await request.json()
    if (typeof creatorId !== "string" || !creatorId) {
      return NextResponse.json({ error: "Invalid creatorId" }, { status: 400 })
    }

    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("role, profile_data")
      .eq("id", user.id)
      .maybeSingle()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 })
    }

    const currentRole = data?.role ?? "user"
    const currentProfileData = (data?.profile_data as Record<string, unknown> | null) ?? {}
    const userData = (currentProfileData.user as Record<string, unknown> | undefined) ?? {}
    const savedCreators = Array.isArray(userData.savedCreators)
      ? userData.savedCreators.filter((id: unknown) => id !== creatorId)
      : []

    const nextProfileData = {
      ...currentProfileData,
      user: {
        ...userData,
        savedCreators,
      },
    }

    const { error: saveError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        role: currentRole,
        profile_data: nextProfileData,
      },
      { onConflict: "id" }
    )

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, savedCreators })
  } catch {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 })
  }
}
