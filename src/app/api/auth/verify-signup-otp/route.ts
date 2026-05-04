import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { mapSupabaseAuthError } from "@/lib/auth-error-messages"
import { isAuthRole, isSignInAllowedRole, resolveUserRole } from "@/lib/auth-roles"
import { verifySignupOtpSchema } from "@/lib/auth-validators"
import { resolvePersistedRole, upsertProfileRole } from "@/lib/profile-role"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler"

function firstZodMessage(error: ZodError): string {
  const flat = error.flatten()
  const field = Object.values(flat.fieldErrors).flat()[0]
  return (typeof field === "string" ? field : flat.formErrors[0]) ?? "Invalid request."
}

export async function POST(request: NextRequest) {
  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const parsed = verifySignupOtpSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 })
  }

  const { email, token, role: bodyRole } = parsed.data
  const { supabase, applyAuthCookiesTo } = createRouteHandlerSupabaseClient(request)

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  })

  if (error || !data.user) {
    return NextResponse.json(
      { error: mapSupabaseAuthError(error?.message, "otp") },
      { status: 400 },
    )
  }

  if (!data.session) {
    return NextResponse.json(
      { error: "We could not start your session after verification. Please try signing in." },
      { status: 400 },
    )
  }

  let userRole = await resolvePersistedRole(supabase, data.user)
  if (!userRole) {
    const metadataRole = resolveUserRole(data.user)
    const chosen =
      isSignInAllowedRole(bodyRole) ? bodyRole : metadataRole && isAuthRole(metadataRole) ? metadataRole : null
    if (chosen && isAuthRole(chosen)) {
      await upsertProfileRole(supabase, data.user.id, chosen)
      userRole = chosen
    }
  }

  if (!isAuthRole(userRole)) {
    await supabase.auth.signOut()
    return NextResponse.json(
      { error: "We could not resolve your account role. Please contact support." },
      { status: 400 },
    )
  }

  const response = NextResponse.json({
    message: "Email verified. You are signed in.",
    role: userRole,
  })
  applyAuthCookiesTo(response)
  return response
}
