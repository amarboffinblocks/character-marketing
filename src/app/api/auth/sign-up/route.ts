import { NextResponse } from "next/server"

import { isSignInAllowedRole } from "@/lib/auth-roles"
import { upsertProfileRole } from "@/lib/profile-role"
import { createServerSupabaseClient } from "@/lib/supabase/server"

type SignUpPayload = {
  fullName?: string
  email?: string
  password?: string
  role?: string
}

export async function POST(request: Request) {
  const body = (await request.json()) as SignUpPayload
  const fullName = body.fullName?.trim()
  const email = body.email?.trim().toLowerCase()
  const password = body.password
  const role = body.role

  if (!fullName || !email || !password || !isSignInAllowedRole(role)) {
    return NextResponse.json({ error: "Invalid sign-up payload." }, { status: 400 })
  }

  const callbackUrl = new URL("/auth/callback", request.url)
  callbackUrl.searchParams.set("role", role)

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl.toString(),
      data: {
        full_name: fullName,
        role,
      },
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (data.user) {
    await upsertProfileRole(supabase, data.user.id, role)
  }

  return NextResponse.json({
    message: "Account created. Check your inbox to confirm your email.",
  })
}
