import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/layout/app-sidebar"
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
  const creatorData = (profileData.creator as Partial<CreatorProfileForm> | undefined) ?? {}
  const normalizedCreator: CreatorProfileForm = {
    ...defaultProfileForm,
    ...creatorData,
    email:
      typeof creatorData.email === "string"
        ? creatorData.email
        : typeof (creatorData as { handle?: unknown }).handle === "string"
          ? ((creatorData as { handle: string }).handle ?? "")
          : user.email ?? "",
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
        {/* <DashboardHeader showSearch={false} /> */}
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
