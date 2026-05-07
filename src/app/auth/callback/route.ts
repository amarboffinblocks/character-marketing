import { createClient } from "@supabase/supabase-js"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { isAuthRole, isSignInAllowedRole, resolveUserRole } from "@/lib/auth-roles"
import { resolvePersistedRole, upsertProfileRole } from "@/lib/profile-role"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler"

async function deleteAuthUserIfPossible(userId: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) return

  const adminClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  await adminClient.auth.admin.deleteUser(userId)
}

function redirectWithCookies(applyAuthCookiesTo: (response: NextResponse) => void, destination: URL) {
  const response = NextResponse.redirect(destination)
  applyAuthCookiesTo(response)
  return response
}

function isRecentAuthUser(createdAt: string | null | undefined) {
  const createdAtMs = Date.parse(createdAt ?? "")
  return Number.isFinite(createdAtMs) && Date.now() - createdAtMs < 5 * 60 * 1000
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const oauthError = requestUrl.searchParams.get("error")
  const oauthErrorDescription = requestUrl.searchParams.get("error_description")
  const mode = requestUrl.searchParams.get("mode")
  const selectedRole = requestUrl.searchParams.get("role")
  const nextPath = requestUrl.searchParams.get("next") ?? "/"

  if (!code) {
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("error", oauthError ?? "oauth_code_missing")
    if (oauthErrorDescription) {
      signInUrl.searchParams.set("error_description", oauthErrorDescription)
    }
    return NextResponse.redirect(signInUrl)
  }

  const { supabase, applyAuthCookiesTo } = createRouteHandlerSupabaseClient(request)
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return redirectWithCookies(applyAuthCookiesTo, new URL("/sign-in?error=oauth_exchange_failed", request.url))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirectWithCookies(applyAuthCookiesTo, new URL("/sign-in?error=user_not_found", request.url))
  }

  const isSelectedRoleAllowed = isSignInAllowedRole(selectedRole)
  const isSignInFlow = mode === "sign-in"
  const isSignUpFlow = mode === "sign-up"
  const metadataRole = resolveUserRole(user)
  const isRecentlyCreated = isRecentAuthUser(user.created_at)

  const { data: existingProfileRow } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle()

  if (isSignInFlow) {
    const existingRole = isAuthRole(existingProfileRow?.role) ? existingProfileRow.role : null

    if (!existingRole) {
      if (isRecentlyCreated) {
        await deleteAuthUserIfPossible(user.id)
      }
      await supabase.auth.signOut()
      return redirectWithCookies(applyAuthCookiesTo, new URL("/sign-in?error=user_not_registered_oauth", request.url))
    }

    const roleMatches = !isSelectedRoleAllowed || existingRole === selectedRole
    if (!roleMatches) {
      await supabase.auth.signOut()
      return redirectWithCookies(applyAuthCookiesTo, new URL("/sign-in?error=unauthorized_role", request.url))
    }

    if (metadataRole !== existingRole) {
      const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
        data: { role: existingRole },
      })

      if (!updateError && updatedUser.user) {
        await upsertProfileRole(supabase, updatedUser.user.id, existingRole)
      }
    }

    const defaultPath =
      existingRole === "admin" ? "/dashboard/admin" : existingRole === "creator" ? "/dashboard/creator" : "/"
    const safeNextPath = nextPath.startsWith("/") ? nextPath : defaultPath
    const destination = safeNextPath === "/" ? defaultPath : safeNextPath
    return redirectWithCookies(applyAuthCookiesTo, new URL(destination, request.url))
  }

  let userRole = await resolvePersistedRole(supabase, user)

  // For OAuth signups, persist selected role for newly created accounts before auth checks.
  const shouldApplySelectedRole =
    isSignUpFlow &&
    isSelectedRoleAllowed &&
    (!userRole || !existingProfileRow || (isRecentlyCreated && userRole !== selectedRole))

  if (shouldApplySelectedRole) {
    const { data, error: updateError } = await supabase.auth.updateUser({
      data: {
        role: selectedRole,
      },
    })

    if (updateError) {
      await supabase.auth.signOut()
      return redirectWithCookies(applyAuthCookiesTo, new URL("/sign-in?error=role_assignment_failed", request.url))
    }

    if (data.user) {
      userRole = resolveUserRole(data.user)
      if (userRole) {
        await upsertProfileRole(supabase, data.user.id, userRole)
      }
    }
  }

  if (!userRole && metadataRole && existingProfileRow) {
    await upsertProfileRole(supabase, user.id, metadataRole)
    userRole = metadataRole
  }

  const isAllowed = isAuthRole(userRole)
  const roleMatches = !isSelectedRoleAllowed || userRole === selectedRole

  if (!isAllowed || !roleMatches) {
    await supabase.auth.signOut()
    return redirectWithCookies(applyAuthCookiesTo, new URL("/sign-in?error=unauthorized_role", request.url))
  }

  const defaultPath = userRole === "admin" ? "/dashboard/admin" : userRole === "creator" ? "/dashboard/creator" : "/"
  const safeNextPath = nextPath.startsWith("/") ? nextPath : defaultPath
  const destination = safeNextPath === "/" ? defaultPath : safeNextPath
  return redirectWithCookies(applyAuthCookiesTo, new URL(destination, request.url))
}
