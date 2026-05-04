import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { mapSupabaseAuthError } from "@/lib/auth-error-messages"
import { isSignInAllowedRole } from "@/lib/auth-roles"
import { resendSignupSchema } from "@/lib/auth-validators"
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

  const parsed = resendSignupSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 })
  }

  const { email, role } = parsed.data
  const { supabase } = createRouteHandlerSupabaseClient(request)

  const callbackUrl = new URL("/auth/callback", request.url)
  if (isSignInAllowedRole(role)) {
    callbackUrl.searchParams.set("role", role)
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: callbackUrl.toString(),
    },
  })

  if (error) {
    return NextResponse.json(
      { error: mapSupabaseAuthError(error.message, "resend") },
      { status: 400 },
    )
  }

  return NextResponse.json({
    message: "If an account exists for this email, we sent a new verification code.",
  })
}
