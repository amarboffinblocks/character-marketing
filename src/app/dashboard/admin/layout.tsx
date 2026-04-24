import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { computeAdminProfileCompletion, defaultAdminProfileForm, type AdminProfileForm } from "@/features/admin/admin-profile-data"
import { adminSidebarGroups } from "@/features/admin/navigation"
import { resolvePersistedRole } from "@/lib/profile-role"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userRole = user ? await resolvePersistedRole(supabase, user) : null
  if (!user || userRole !== "admin") {
    redirect("/sign-in")
  }

  let showProfileWarning = false
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("profile_data")
    .eq("id", user.id)
    .maybeSingle()

  const profileData = (profileRow?.profile_data as Record<string, unknown> | null) ?? {}
  const adminData = (profileData.admin as Partial<AdminProfileForm> | undefined) ?? {}
  const normalizedAdmin: AdminProfileForm = {
    ...defaultAdminProfileForm,
    ...adminData,
    email: typeof adminData.email === "string" ? adminData.email : user.email ?? "",
  }
  showProfileWarning = computeAdminProfileCompletion(normalizedAdmin).percent < 70
  const userDisplayName =
    normalizedAdmin.displayName.trim() ||
    (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "") ||
    (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "") ||
    "Admin"
  const userEmail = normalizedAdmin.email.trim() || user.email || ""
  const userAvatarUrl = normalizedAdmin.avatarUrl.trim() || null

  const cookieStore = await cookies()
  const sidebarCookie = cookieStore.get("sidebar_state")?.value
  const defaultOpen = sidebarCookie === undefined ? true : sidebarCookie === "true"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar
        groups={adminSidebarGroups}
        workspaceName="Character Market"
        workspaceSubtitle="Admin"
        brandHref="/dashboard/admin"
        showProfileWarning={showProfileWarning}
        userDisplayName={userDisplayName}
        userEmail={userEmail}
        userAvatarUrl={userAvatarUrl}
      />
      <SidebarInset className="bg-background">
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
