import { CreatorDashboardView } from "@/features/creator/dashboard"
import { fetchCreatorOrders } from "@/features/creator/orders/creator-orders"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

async function getWorkspaceStatsWithImage(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  table: string,
  creatorId: string,
  imageColumn: string
) {
  const { count } = await supabase
    .from(table)
    .select("*", { head: true, count: "exact" })
    .eq("creator_id", creatorId)

  let imageUrl = undefined
  if (count && count > 0) {
    const { data } = await supabase
      .from(table)
      .select(imageColumn)
      .eq("creator_id", creatorId)
      .neq(imageColumn, "")
      .not(imageColumn, "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (data && (data as Record<string, any>)[imageColumn]) {
      imageUrl = (data as Record<string, any>)[imageColumn]
    }
  }
  return { count: count ?? 0, imageUrl }
}

export default async function CreatorDashboardPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const [ordersResult, charactersStats, draftCharactersCount, personasStats, lorebooksStats, avatarsStats, backgroundsStats, profileResult, reviewsResult] =
    await Promise.all([
      fetchCreatorOrders(user.id).catch(() => []),
      getWorkspaceStatsWithImage(supabase, "characters", user.id, "avatar_url"),
      supabase.from("characters").select("*", { head: true, count: "exact" }).eq("creator_id", user.id).eq("status", "draft").then(res => res.count ?? 0),
      getWorkspaceStatsWithImage(supabase, "personas", user.id, "avatar_url"),
      getWorkspaceStatsWithImage(supabase, "lorebooks", user.id, "avatar_url"),
      getWorkspaceStatsWithImage(supabase, "avatars", user.id, "image_url"),
      getWorkspaceStatsWithImage(supabase, "backgrounds", user.id, "image_url"),
      supabase.from("profiles").select("profile_data").eq("id", user.id).maybeSingle(),
      supabase.from("creator_reviews").select("rating").eq("creator_id", user.id),
    ])

  const profileData = (profileResult.data?.profile_data as Record<string, unknown> | null) ?? {}
  const creatorProfileRaw = (profileData.creator as Record<string, unknown> | undefined) ?? {}
  const userProfileRaw = (profileData.user as Record<string, unknown> | undefined) ?? {}

  const fullName =
    (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "") ||
    (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "")

  const creatorProfile = {
    ...creatorProfileRaw,
    email: (creatorProfileRaw.email as string) || user.email || "",
    displayName: (creatorProfileRaw.displayName as string) || fullName || "Creator",
    avatarUrl: (creatorProfileRaw.avatarUrl as string) || (userProfileRaw.avatarUrl as string) || "",
    bannerUrl: (creatorProfileRaw.bannerUrl as string) || (userProfileRaw.bannerUrl as string) || "",
    tagline: (creatorProfileRaw.tagline as string) || (userProfileRaw.tagline as string) || "",
    shortBio: (creatorProfileRaw.shortBio as string) || (userProfileRaw.shortBio as string) || "",
    longBio: (creatorProfileRaw.longBio as string) || (userProfileRaw.longBio as string) || "",
  }

  const creatorName = creatorProfile.displayName
  const ratings = (reviewsResult.data ?? []).map((item) => Number(item.rating ?? 0)).filter((value) => value > 0)
  const averageRating =
    ratings.length > 0 ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : 0

  return (
    <CreatorDashboardView
      creatorId={user.id}
      dashboardData={{
        creatorName,
        creatorProfile: creatorProfile as any,
        orders: ordersResult,
        workspaceCounts: {
          characters: charactersStats,
          personas: personasStats,
          lorebooks: lorebooksStats,
          avatars: avatarsStats,
          backgrounds: backgroundsStats,
        },
        draftCharacters: draftCharactersCount,
        reviewCount: ratings.length,
        averageRating,
      }}
    />
  )
}
