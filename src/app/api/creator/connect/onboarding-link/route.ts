import { NextResponse } from "next/server"

import { getStripeClient } from "@/lib/payments/stripe"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { resolvePersistedRole } from "@/lib/profile-role"
import { resolveAppUrl } from "@/lib/payments/escrow"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const role = user ? await resolvePersistedRole(supabase, user) : null
  if (!user || role !== "creator") {
    return NextResponse.json({ error: "Unauthorized. Creator account required." }, { status: 401 })
  }

  const admin = createAdminSupabaseClient()
  const { data: profile } = await admin
    .from("profiles")
    .select("id, profile_data")
    .eq("id", user.id)
    .maybeSingle()

  const profileData = (profile?.profile_data ?? {}) as Record<string, unknown>
  const creatorData = (profileData.creator ?? {}) as Record<string, unknown>
  const stripeAccountId =
    typeof creatorData.stripeConnectAccountId === "string" ? creatorData.stripeConnectAccountId.trim() : ""

  if (!stripeAccountId) {
    return NextResponse.json(
      { error: "No Stripe account found. Please create one first." },
      { status: 400 }
    )
  }

  const baseUrl = resolveAppUrl(request)
  const stripe = getStripeClient()

  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${baseUrl}/dashboard/creator/settings?stripe=refresh`,
    return_url: `${baseUrl}/dashboard/creator/settings?stripe=success`,
    type: "account_onboarding",
  })

  return NextResponse.json({ url: accountLink.url })
}
