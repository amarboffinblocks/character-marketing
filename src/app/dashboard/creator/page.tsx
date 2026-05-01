import { CreatorDashboardView } from "@/features/creator/dashboard"
import { fetchCreatorOrders } from "@/features/creator/orders/creator-orders"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

async function safeCount(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  table: string,
  creatorId: string,
  column = "creator_id"
) {
  const { count } = await supabase
    .from(table)
    .select("*", { head: true, count: "exact" })
    .eq(column, creatorId)
  return count ?? 0
}

export default async function CreatorDashboardPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const [ordersResult, charactersCount, draftCharactersCount, personasCount, lorebooksCount, avatarsCount, backgroundsCount, profileResult, reviewsResult] =
    await Promise.all([
      fetchCreatorOrders(user.id).catch(() => []),
      safeCount(supabase, "characters", user.id),
      safeCount(supabase, "characters", user.id).then(async () => {
        const { count } = await supabase
          .from("characters")
          .select("*", { head: true, count: "exact" })
          .eq("creator_id", user.id)
          .eq("status", "draft")
        return count ?? 0
      }),
      safeCount(supabase, "personas", user.id),
      safeCount(supabase, "lorebooks", user.id),
      safeCount(supabase, "avatars", user.id),
      safeCount(supabase, "backgrounds", user.id),
      supabase.from("profiles").select("profile_data").eq("id", user.id).maybeSingle(),
      supabase.from("creator_reviews").select("rating").eq("creator_id", user.id),
    ])

  const profileData = (profileResult.data?.profile_data as Record<string, unknown> | null) ?? null
  const creatorProfile = profileData?.creator as Record<string, unknown> | undefined
  const creatorName =
    (typeof creatorProfile?.displayName === "string" && creatorProfile.displayName.trim()) ||
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()) ||
    "Creator"
  const ratings = (reviewsResult.data ?? []).map((item) => Number(item.rating ?? 0)).filter((value) => value > 0)
  const averageRating =
    ratings.length > 0 ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : 0

  return (
    <CreatorDashboardView
      creatorId={user.id}
      dashboardData={{
        creatorName,
        orders: ordersResult,
        workspaceCounts: {
          characters: charactersCount,
          personas: personasCount,
          lorebooks: lorebooksCount,
          avatars: avatarsCount,
          backgrounds: backgroundsCount,
        },
        draftCharacters: draftCharactersCount,
        reviewCount: ratings.length,
        averageRating,
      }}
    />
  )
}
