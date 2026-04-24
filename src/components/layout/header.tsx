import { createServerSupabaseClient } from "@/lib/supabase/server"
import { computeCompletion, defaultProfileForm, type CreatorProfileForm } from "@/features/creator/profile/profile-data"

import { HeaderClient } from "./header-client"

export async function Header() {
  let isAuthenticated = false
  let showProfileWarning = false

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
      showProfileWarning = completion.percent < 70
    }
  } catch {
    isAuthenticated = false
    showProfileWarning = false
  }

  return <HeaderClient isAuthenticated={isAuthenticated} showProfileWarning={showProfileWarning} />
}
