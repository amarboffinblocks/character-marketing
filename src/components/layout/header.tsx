import { createServerSupabaseClient } from "@/lib/supabase/server"
import { computeCompletion, defaultProfileForm, type CreatorProfileForm } from "@/features/creator/profile/profile-data"

import { HeaderClient } from "./header-client"

export async function Header() {
  let isAuthenticated = false
  let showProfileWarning = false
  let userRole = "user"

  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    isAuthenticated = Boolean(user)

    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("role, profile_data")
        .eq("id", user.id)
        .maybeSingle()

      const profileData = (data?.profile_data as Record<string, unknown> | null) ?? {}
      const roleKey =
        typeof data?.role === "string" && data.role.trim().length > 0
          ? data.role
          : typeof user.user_metadata?.role === "string" && user.user_metadata.role.trim().length > 0
            ? user.user_metadata.role
            : "user"
      userRole = roleKey

      const selected = (profileData[roleKey] as Partial<CreatorProfileForm> | undefined) ?? {}
      const normalized: CreatorProfileForm = {
        ...defaultProfileForm,
        ...selected,
        email:
          typeof selected.email === "string"
            ? selected.email
            : typeof (selected as { handle?: unknown }).handle === "string"
              ? ((selected as { handle: string }).handle ?? "")
              : user.email ?? "",
      }
      const completion = computeCompletion(normalized)
      showProfileWarning = roleKey === "creator" && completion.percent < 80

      let avatarUrlCandidate: string | null = null
      if (normalized.avatarUrl && typeof normalized.avatarUrl === "string" && normalized.avatarUrl.trim().length > 0) {
        avatarUrlCandidate = normalized.avatarUrl.trim()
      } else if (profileData && typeof profileData.avatarUrl === "string" && profileData.avatarUrl.trim().length > 0) {
        avatarUrlCandidate = profileData.avatarUrl.trim()
      } else if (
        profileData &&
        profileData.creator &&
        typeof profileData.creator === "object" &&
        typeof (profileData.creator as Record<string, unknown>).avatarUrl === "string" &&
        (profileData.creator as Record<string, string>).avatarUrl.trim().length > 0
      ) {
        avatarUrlCandidate = (profileData.creator as Record<string, string>).avatarUrl.trim()
      }

      return (
        <HeaderClient
          isAuthenticated={isAuthenticated}
          showProfileWarning={showProfileWarning}
          avatarUrl={avatarUrlCandidate}
          userRole={userRole}
        />
      )
    }
  } catch {
    isAuthenticated = false
    showProfileWarning = false
  }

  return (
    <HeaderClient
      isAuthenticated={isAuthenticated}
      showProfileWarning={showProfileWarning}
      avatarUrl={null}
      userRole={userRole}
    />
  )
}
