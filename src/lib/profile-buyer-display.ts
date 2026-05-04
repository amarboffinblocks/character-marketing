/**
 * Resolve buyer-facing display fields from `profiles.profile_data`.
 * Data is stored per role (`user`, `creator`, `admin`); buyers often only have `creator` filled.
 */

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function nested(root: Record<string, unknown>, key: string): Record<string, unknown> | null {
  const v = root[key]
  return v && typeof v === "object" ? (v as Record<string, unknown>) : null
}

export function buyerSummaryFromProfileData(profileData: unknown): {
  displayName: string
  handle: string
  avatarUrl: string | null
  email: string
} {
  const root = profileData && typeof profileData === "object" ? (profileData as Record<string, unknown>) : null
  if (!root) {
    return { displayName: "", handle: "", avatarUrl: null, email: "" }
  }

  const user = nested(root, "user")
  const creator = nested(root, "creator")
  const admin = nested(root, "admin")

  const displayName =
    str(user?.displayName) ||
    str(user?.name) ||
    str(creator?.displayName) ||
    str(creator?.name) ||
    str(admin?.displayName) ||
    str(admin?.name) ||
    str(root.displayName) ||
    str(root.name) ||
    str(root.full_name)

  const handleRaw =
    str(user?.handle) || str(creator?.handle) || str(admin?.handle) || str(root.handle)
  const handle = handleRaw.startsWith("@") || handleRaw.length === 0 ? handleRaw : `@${handleRaw}`

  const email = str(user?.email) || str(creator?.email) || str(admin?.email) || str(root.email)

  const avatarUrlRaw =
    str(user?.avatarUrl) ||
    str(creator?.avatarUrl) ||
    str(admin?.avatarUrl) ||
    str(root.avatarUrl)

  return {
    displayName,
    handle,
    avatarUrl: avatarUrlRaw.length > 0 ? avatarUrlRaw : null,
    email,
  }
}
