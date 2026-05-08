import { redirect } from "next/navigation"

import { AdminPayoutsView } from "@/features/admin/admin-payouts-view"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { resolvePersistedRole } from "@/lib/profile-role"
import { prisma } from "@/lib/prisma"

export default async function AdminPayoutsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const role = user ? await resolvePersistedRole(supabase, user) : null
  if (!user || role !== "admin") {
    redirect("/sign-in")
  }

  // Fetch pending payouts
  const pendingRequests = await prisma.payoutRequest.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" }, // Oldest first
    include: {
      creator: {
        select: {
          id: true,
          profileData: true,
        },
      },
    },
  })

  // Format data for the view
  const formattedRequests = pendingRequests.map((req) => {
    const profileData = req.creator.profileData as any
    const displayName = profileData?.creator?.displayName || profileData?.creator?.name || "Creator"
    const stripeAccountId = profileData?.creator?.stripeConnectAccountId || ""

    return {
      id: req.id,
      creatorId: req.creator.id,
      creatorName: displayName,
      amountCents: req.amount,
      date: req.createdAt.toISOString(),
      stripeAccountId,
    }
  })

  return <AdminPayoutsView pendingRequests={formattedRequests} />
}
