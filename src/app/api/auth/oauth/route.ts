import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import type { Provider } from "@supabase/supabase-js"

import { isSignInAllowedRole } from "@/lib/auth-roles"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler"

type OAuthPayload = {
  provider?: string
  mode?: string
  role?: string
  next?: string
}

const allowedProviders = new Set<Provider>(["google", "twitter", "x"])
const allowedModes = new Set(["sign-in", "sign-up"] as const)

export async function POST(request: NextRequest) {
  const body = (await request.json()) as OAuthPayload
  const rawProvider = body.provider as Provider
  const mode = body.mode
  const role = body.role
  const nextPath = body.next

  if (!allowedProviders.has(rawProvider)) {
    return NextResponse.json({ error: "Invalid OAuth payload." }, { status: 400 })
  }

  if (!mode || !allowedModes.has(mode as "sign-in" | "sign-up")) {
    return NextResponse.json({ error: "Invalid OAuth payload." }, { status: 400 })
  }

  if (role && !isSignInAllowedRole(role)) {
    return NextResponse.json({ error: "Invalid OAuth payload." }, { status: 400 })
  }

  const origin = new URL(request.url).origin
  const callbackUrl = new URL("/auth/callback", origin)
  callbackUrl.searchParams.set("mode", mode)
  if (role) {
    callbackUrl.searchParams.set("role", role)
  }
  if (typeof nextPath === "string" && nextPath.startsWith("/")) {
    callbackUrl.searchParams.set("next", nextPath)
  }

  const { supabase, applyAuthCookiesTo } = createRouteHandlerSupabaseClient(request)
  const provider: Provider = rawProvider === "x" ? "twitter" : rawProvider
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl.toString(),
    },
  })

  if (error || !data.url) {
    const res = NextResponse.json({ error: error?.message ?? "Unable to start OAuth." }, { status: 400 })
    applyAuthCookiesTo(res)
    return res
  }

  const res = NextResponse.json({ url: data.url })
  applyAuthCookiesTo(res)
  return res
}
