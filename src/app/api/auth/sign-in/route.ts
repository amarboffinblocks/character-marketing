import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { mapSupabaseAuthError } from "@/lib/auth-error-messages"
import { isAuthRole, resolveUserRole } from "@/lib/auth-roles"
import { signInRequestSchema } from "@/lib/auth-validators"
import { resolvePersistedRole, upsertProfileRole } from "@/lib/profile-role"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler"

function firstZodMessage(error: ZodError): string {
  const flat = error.flatten()
  const field = Object.values(flat.fieldErrors).flat()[0]
  return (typeof field === "string" ? field : flat.formErrors[0]) ?? "Invalid request."
}

function signInErrorPayload(message: string | undefined, email: string) {
  const mapped = mapSupabaseAuthError(message, "sign-in")
  const lower = (message ?? "").toLowerCase()
  const needsEmailConfirmation =
    lower.includes("email not confirmed") || lower.includes("email address not confirmed")
  return {
    error: mapped,
    ...(needsEmailConfirmation ? { code: "email_not_confirmed" as const, email } : {}),
  }
}

export async function POST(request: NextRequest) {
  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const parsed = signInRequestSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 })
  }

  const { email, password } = parsed.data
  const { supabase, applyAuthCookiesTo } = createRouteHandlerSupabaseClient(request)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return NextResponse.json(signInErrorPayload(error?.message, email), { status: 401 })
  }

  let userRole = await resolvePersistedRole(supabase, data.user)

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
      return NextResponse.json(
        { error: "Unable to assign account role. Please try again." },
        { status: 400 },
      )
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
      { status: 403 },
    )
  }

  const response = NextResponse.json({ message: "Signed in successfully.", role: userRole })
  applyAuthCookiesTo(response)
  return response
}
