import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { mapSupabaseAuthError } from "@/lib/auth-error-messages"
import { signUpRequestSchema } from "@/lib/auth-validators"
import { upsertProfileRole } from "@/lib/profile-role"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler"

/**
 * Signup confirmation email body is rendered by Supabase (Dashboard → Auth → Email templates →
 * **Confirm sign up**). `signUp` cannot switch “link email” vs “OTP email”; the template does.
 *
 * If users see a PKCE verify URL / “Verify Email Address” button instead of a numeric code,
 * the template is using `{{ .ConfirmationURL }}` without showing `{{ .Token }}`. Fix: see
 * `supabase/email-templates/INSTRUCTIONS.txt` and paste `confirm-signup-otp-only.html` or
 * `confirm-signup-otp-only-branded.html` (OTP only — no confirmation link).
 */
function firstZodMessage(error: ZodError): string {
  const flat = error.flatten()
  const field = Object.values(flat.fieldErrors).flat()[0]
  return (typeof field === "string" ? field : flat.formErrors[0]) ?? "Invalid sign-up request."
}

export async function POST(request: NextRequest) {
  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const parsed = signUpRequestSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 })
  }

  const { fullName, email, password, role } = parsed.data
  const { supabase, applyAuthCookiesTo } = createRouteHandlerSupabaseClient(request)

  const callbackUrl = new URL("/auth/callback", request.url)
  callbackUrl.searchParams.set("role", role)

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
    return NextResponse.json(
      { error: mapSupabaseAuthError(error.message, "sign-up") },
      { status: 400 },
    )
  }

  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    return NextResponse.json(
      { error: "This account is already registered. Please sign in instead." },
      { status: 409 },
    )
  }

  if (data.user) {
    await upsertProfileRole(supabase, data.user.id, role)
  }

  const needsEmailConfirmation = !data.session
  const message = needsEmailConfirmation
    ? "We sent a verification code to your email. Enter it below to finish signing up."
    : "Your account is ready. You are signed in."

  const response = NextResponse.json({
    message,
    needsEmailConfirmation,
    email,
    role,
  })

  if (data.session) {
    applyAuthCookiesTo(response)
  }

  return response
}
