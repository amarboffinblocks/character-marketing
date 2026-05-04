import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { z, ZodError } from "zod"

import { mapSupabaseAuthError } from "@/lib/auth-error-messages"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler"

const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/^\S+$/, "Password cannot contain spaces"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

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

  const parsed = updatePasswordSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 })
  }

  const { supabase, applyAuthCookiesTo } = createRouteHandlerSupabaseClient(request)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: "Your reset link expired or is invalid. Request a new one from forgot password." },
      { status: 401 },
    )
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) {
    return NextResponse.json(
      { error: mapSupabaseAuthError(error.message, "sign-in") },
      { status: 400 },
    )
  }

  const response = NextResponse.json({ message: "Your password was updated." })
  applyAuthCookiesTo(response)
  return response
}
