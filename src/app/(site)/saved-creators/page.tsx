import { CreatorMarketplaceView, sortOptions } from "@/features/site/marketplace"
import { buildTags, getMarketplaceCreators } from "@/features/site/marketplace/data/marketplace-server-data"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function SavedCreatorsPage() {
  let savedCreatorIds: string[] = []
  
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("profile_data")
        .eq("id", user.id)
        .maybeSingle()

      const profileData = (data?.profile_data as Record<string, unknown> | null) ?? {}
      const userData = (profileData.user as Record<string, unknown> | undefined) ?? {}
      if (Array.isArray(userData.savedCreators)) {
        savedCreatorIds = userData.savedCreators.filter((id): id is string => typeof id === "string")
      }
    }
  } catch (err) {
    console.error("Failed to load saved creators list", err)
  }

  const creators = await getMarketplaceCreators()
  const filtered = creators.filter((c) => savedCreatorIds.includes(c.id))
  const tags = buildTags(filtered)

  return (
    <CreatorMarketplaceView
      creators={filtered}
      categories={tags}
      sortOptions={sortOptions}
    />
  )
}
