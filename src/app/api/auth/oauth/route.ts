import { NextResponse } from "next/server"
import type { Provider } from "@supabase/supabase-js"

import { isSignInAllowedRole } from "@/lib/auth-roles"
import { createServerSupabaseClient } from "@/lib/supabase/server"

type OAuthPayload = {
  provider?: string
  role?: string
}

const allowedProviders = new Set<Provider>(["google", "twitter", "x"])

export async function POST(request: Request) {
  const body = (await request.json()) as OAuthPayload
  const provider = body.provider as Provider
  const role = body.role

  if (!allowedProviders.has(provider)) {
    return NextResponse.json({ error: "Invalid OAuth payload." }, { status: 400 })
  }

  if (role && !isSignInAllowedRole(role)) {
    return NextResponse.json({ error: "Invalid OAuth payload." }, { status: 400 })
  }

  const origin = new URL(request.url).origin
  const callbackUrl = new URL("/auth/callback", origin)
  if (role) {
    callbackUrl.searchParams.set("role", role)
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl.toString(),
    },
  })

  if (error || !data.url) {
    return NextResponse.json({ error: error?.message ?? "Unable to start OAuth." }, { status: 400 })
  }

  return NextResponse.json({ url: data.url })
}
