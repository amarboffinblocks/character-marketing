import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { mapSupabaseAuthError } from "@/lib/auth-error-messages"
import { emailOnlySchema } from "@/lib/auth-validators"
import { createServerSupabaseClient } from "@/lib/supabase/server"

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

  const parsed = emailOnlySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 })
  }

  const { email } = parsed.data
  const supabase = await createServerSupabaseClient()

  const redirectTo = new URL("/auth/callback?next=/reset-password", request.url).toString()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) {
    return NextResponse.json(
      { error: mapSupabaseAuthError(error.message, "forgot-password") },
      { status: 400 },
    )
  }

  return NextResponse.json({
    message: "If an account exists for this email, we sent a password reset link.",
  })
}
