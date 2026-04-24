import type { SupabaseClient, User } from "@supabase/supabase-js"

import { isAuthRole, resolveUserRole, type AuthRole } from "@/lib/auth-roles"

type ProfilesRoleRow = { role: string | null }

export async function getProfileRole(
  supabase: SupabaseClient,
  userId: string
): Promise<AuthRole | null> {
  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle()

  if (error || !data) return null

  const role = (data as ProfilesRoleRow).role
  return isAuthRole(role) ? role : null
}

export async function upsertProfileRole(
  supabase: SupabaseClient,
  userId: string,
  role: AuthRole
): Promise<void> {
  await supabase.from("profiles").upsert(
    {
      id: userId,
      role,
    },
    { onConflict: "id" }
  )
}

export async function resolvePersistedRole(supabase: SupabaseClient, user: User): Promise<AuthRole | null> {
  const profileRole = await getProfileRole(supabase, user.id)
  if (profileRole) return profileRole

  const roleFromMetadata = resolveUserRole(user)
  if (roleFromMetadata && isAuthRole(roleFromMetadata)) {
    await upsertProfileRole(supabase, user.id, roleFromMetadata)
    return roleFromMetadata
  }

  return null
}
