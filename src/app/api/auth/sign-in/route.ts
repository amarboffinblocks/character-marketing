import { NextResponse } from "next/server"

import { isAuthRole, resolveUserRole } from "@/lib/auth-roles"
import { resolvePersistedRole, upsertProfileRole } from "@/lib/profile-role"
import { createServerSupabaseClient } from "@/lib/supabase/server"

type SignInPayload = {
  email?: string
  password?: string
}

export async function POST(request: Request) {
  const body = (await request.json()) as SignInPayload
  const email = body.email?.trim().toLowerCase()
  const password = body.password

  if (!email || !password) {
    return NextResponse.json({ error: "Invalid sign-in payload." }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "Unable to sign in." }, { status: 400 })
  }

  let userRole = await resolvePersistedRole(supabase, data.user)

  // Backfill legacy users created before role metadata was set.
  if (!userRole) {
    const metadataRole = resolveUserRole(data.user)

    if (metadataRole) {
      await upsertProfileRole(supabase, data.user.id, metadataRole)
      userRole = metadataRole
    }
  }

  if (!userRole) {
    const { data: updated, error: updateError } = await supabase.auth.updateUser({
      data: { role: "user" },
    })

    if (updateError) {
      await supabase.auth.signOut()
      return NextResponse.json({ error: "Unable to assign account role. Please try again." }, { status: 400 })
    }

    if (updated.user) {
      userRole = resolveUserRole(updated.user)
      if (userRole) {
        await upsertProfileRole(supabase, updated.user.id, userRole)
      }
    }
  }

  if (!isAuthRole(userRole)) {
    await supabase.auth.signOut()
    return NextResponse.json(
      {
        error: "Unauthorized role. Please contact support.",
      },
      { status: 403 }
    )
  }

  return NextResponse.json({ message: "Signed in successfully.", role: userRole })
}
