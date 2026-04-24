import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { isAuthRole, isSignInAllowedRole, resolveUserRole } from "@/lib/auth-roles"
import { resolvePersistedRole, upsertProfileRole } from "@/lib/profile-role"
import { createServerSupabaseClient } from "@/lib/supabase/server"

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

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const oauthError = requestUrl.searchParams.get("error")
  const oauthErrorDescription = requestUrl.searchParams.get("error_description")
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

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(new URL("/sign-in?error=oauth_exchange_failed", request.url))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/sign-in?error=user_not_found", request.url))
  }

  const isSelectedRoleAllowed = isSignInAllowedRole(selectedRole)
  const isSignInFlow = !isSelectedRoleAllowed
  const metadataRole = resolveUserRole(user)
  const createdAtMs = Date.parse(user.created_at ?? "")
  const isRecentlyCreated = Number.isFinite(createdAtMs) && Date.now() - createdAtMs < 5 * 60 * 1000

  let userRole = await resolvePersistedRole(supabase, user)

  // In login flow, block brand-new OAuth accounts only if no persisted role exists.
  if (isSignInFlow && !userRole && !metadataRole && isRecentlyCreated) {
    await deleteAuthUserIfPossible(user.id)
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL("/sign-in?error=user_not_registered_oauth", request.url))
  }

  const { data: existingProfileRow } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (isSignInFlow && !existingProfileRow) {
    if (metadataRole) {
      await upsertProfileRole(supabase, user.id, metadataRole)
      userRole = metadataRole
    } else {
      await deleteAuthUserIfPossible(user.id)
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL("/sign-in?error=user_not_registered_oauth", request.url))
    }
  }

  // For OAuth signups, persist selected role for newly created accounts before auth checks.
  const shouldApplySelectedRole =
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
      return NextResponse.redirect(new URL("/sign-in?error=role_assignment_failed", request.url))
    }

    if (data.user) {
      userRole = resolveUserRole(data.user)
      if (userRole) {
        await upsertProfileRole(supabase, data.user.id, userRole)
      }
    }
  }

  // Reject sign-in if no persisted role can be resolved.
  // This prevents auto-registering new social accounts from login flow.
  if (!userRole && isSignInFlow) {
    await deleteAuthUserIfPossible(user.id)
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL("/sign-in?error=user_not_registered_oauth", request.url))
  }

  const isAllowed = isAuthRole(userRole)
  const roleMatches = !isSelectedRoleAllowed || userRole === selectedRole

  if (!isAllowed || !roleMatches) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL("/sign-in?error=unauthorized_role", request.url))
  }

  const defaultPath = userRole === "admin" ? "/dashboard/admin" : userRole === "creator" ? "/dashboard/creator" : "/"
  const safeNextPath = nextPath.startsWith("/") ? nextPath : defaultPath
  const destination = safeNextPath === "/" ? defaultPath : safeNextPath
  return NextResponse.redirect(new URL(destination, request.url))
}
