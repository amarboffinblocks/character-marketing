import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { computeCompletion, defaultProfileForm, type CreatorProfileForm } from "@/features/creator/profile/profile-data"
import { creatorSidebarGroups } from "@/features/creator/navigation"
import { resolvePersistedRole } from "@/lib/profile-role"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function CreatorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userRole = user ? await resolvePersistedRole(supabase, user) : null
  if (!user || userRole !== "creator") {
    redirect("/sign-in")
  }

  let showProfileWarning = false
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("profile_data")
    .eq("id", user.id)
    .maybeSingle()

  const profileData = (profileRow?.profile_data as Record<string, unknown> | null) ?? {}
  const userData = (profileData.user as Record<string, unknown> | undefined) ?? {}
  const creatorData = (profileData.creator as Partial<CreatorProfileForm> | undefined) ?? {}
  const normalizedCreator: CreatorProfileForm = {
    ...defaultProfileForm,
    ...creatorData,
    email:
      typeof creatorData.email === "string" && creatorData.email.trim().length > 0
        ? creatorData.email
        : typeof (creatorData as { handle?: unknown }).handle === "string"
          ? ((creatorData as { handle: string }).handle ?? "")
          : user.email ?? "",
    avatarUrl:
      typeof creatorData.avatarUrl === "string" && creatorData.avatarUrl.trim().length > 0
        ? creatorData.avatarUrl
        : (typeof userData.avatarUrl === "string" ? userData.avatarUrl : ""),
    bannerUrl:
      typeof creatorData.bannerUrl === "string" && creatorData.bannerUrl.trim().length > 0
        ? creatorData.bannerUrl
        : (typeof userData.bannerUrl === "string" ? userData.bannerUrl : ""),
    tagline:
      typeof creatorData.tagline === "string" && creatorData.tagline.trim().length > 0
        ? creatorData.tagline
        : (typeof userData.tagline === "string" ? userData.tagline : ""),
    shortBio:
      typeof creatorData.shortBio === "string" && creatorData.shortBio.trim().length > 0
        ? creatorData.shortBio
        : (typeof userData.shortBio === "string" ? userData.shortBio : ""),
    longBio:
      typeof creatorData.longBio === "string" && creatorData.longBio.trim().length > 0
        ? creatorData.longBio
        : (typeof userData.longBio === "string" ? userData.longBio : ""),
  }
  showProfileWarning = computeCompletion(normalizedCreator).percent < 70
  const userDisplayName =
    normalizedCreator.displayName.trim() ||
    (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "") ||
    (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "") ||
    "Creator"
  const userEmail = normalizedCreator.email.trim() || user.email || ""
  const userAvatarUrl = normalizedCreator.avatarUrl.trim() || null

  // Persist the sidebar open/collapsed state across navigations.
  const cookieStore = await cookies()
  const sidebarCookie = cookieStore.get("sidebar_state")?.value
  const defaultOpen = sidebarCookie === undefined ? true : sidebarCookie === "true"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar
        groups={creatorSidebarGroups}
        showProfileWarning={showProfileWarning}
        userDisplayName={userDisplayName}
        userEmail={userEmail}
        userAvatarUrl={userAvatarUrl}
      />
      <SidebarInset className="bg-background">
        <DashboardHeader 
          showSearch={false} 
          user={{
            name: userDisplayName,
            email: userEmail,
            avatarUrl: userAvatarUrl,
            role: "Creator"
          }}
        />
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
