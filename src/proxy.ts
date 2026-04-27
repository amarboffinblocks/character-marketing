import { createServerClient } from "@supabase/ssr"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { resolvePersistedRole } from "@/lib/profile-role"

const AUTH_ROUTES = ["/sign-in", "/sign-up", "/forgot-password", "/verify-email", "/otp-verification"] as const

const PRIVATE_ROUTE_PREFIXES = [
  "/profile",
  "/orders",
  "/messages",
  "/settings",
  "/transactions",
  "/inventory",
  "/saved-creators",
  "/post-a-bid",
] as const

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname as (typeof AUTH_ROUTES)[number])
}

function isPrivateRoute(pathname: string): boolean {
  if (PRIVATE_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return true
  }

  const segments = pathname.split("/").filter(Boolean)
  return segments.length >= 3 && segments[0] === "creators" && ["custom-package", "purchase-preselect"].includes(segments[2])
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isDashboardRoute = pathname.startsWith("/dashboard")
  const requiresAuth = isPrivateRoute(pathname) || isDashboardRoute

  let response = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) return response

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      if (requiresAuth) {
        const signInUrl = request.nextUrl.clone()
        signInUrl.pathname = "/sign-in"
        signInUrl.searchParams.set("next", pathname)
        return NextResponse.redirect(signInUrl)
      }

      return response
    }

    const role = await resolvePersistedRole(supabase, user)

    if (pathname === "/" && (role === "admin" || role === "creator")) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = role === "admin" ? "/dashboard/admin" : "/dashboard/creator"
      redirectUrl.search = ""
      return NextResponse.redirect(redirectUrl)
    }

    // Allow logged-in buyers/users to access sign-up and start creator onboarding.
    if (pathname === "/sign-up" && role === "user") {
      return response
    }

    if (isAuthRoute(pathname)) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = role === "admin" ? "/dashboard/admin" : role === "creator" ? "/dashboard/creator" : "/"
      redirectUrl.search = ""
      return NextResponse.redirect(redirectUrl)
    }

    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = "/sign-in"
      redirectUrl.search = ""
      return NextResponse.redirect(redirectUrl)
    }

    if (pathname.startsWith("/dashboard/creator") && role !== "creator") {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = "/sign-in"
      redirectUrl.search = ""
      return NextResponse.redirect(redirectUrl)
    }

    return response
  } catch {
    if (requiresAuth) {
      const signInUrl = request.nextUrl.clone()
      signInUrl.pathname = "/sign-in"
      signInUrl.searchParams.set("next", pathname)
      return NextResponse.redirect(signInUrl)
    }

    return response
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
