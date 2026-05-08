import { NextResponse } from "next/server"

import { getStripeClient } from "@/lib/payments/stripe"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { resolvePersistedRole } from "@/lib/profile-role"

export const runtime = "nodejs"

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const role = user ? await resolvePersistedRole(supabase, user) : null
  if (!user || role !== "creator") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
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
    return NextResponse.json({
      connected: false,
      stripeAccountId: null,
      payoutsEnabled: false,
      chargesEnabled: false,
      onboardingCompleted: false,
    })
  }

  // Fetch live status from Stripe
  const stripe = getStripeClient()
  const account = await stripe.accounts.retrieve(stripeAccountId)

  const payoutsEnabled = account.payouts_enabled ?? false
  const chargesEnabled = account.charges_enabled ?? false
  const onboardingCompleted =
    payoutsEnabled && chargesEnabled && !account.requirements?.currently_due?.length

  // Sync status back to profile if it changed
  const storedPayoutsEnabled = creatorData.stripePayoutsEnabled === true
  const storedChargesEnabled = creatorData.stripeChargesEnabled === true
  const storedOnboarding = creatorData.stripeOnboardingCompleted === true

  if (
    storedPayoutsEnabled !== payoutsEnabled ||
    storedChargesEnabled !== chargesEnabled ||
    storedOnboarding !== onboardingCompleted
  ) {
    await admin
      .from("profiles")
      .update({
        profile_data: {
          ...profileData,
          creator: {
            ...creatorData,
            stripePayoutsEnabled: payoutsEnabled,
            stripeChargesEnabled: chargesEnabled,
            stripeOnboardingCompleted: onboardingCompleted,
          },
        },
      })
      .eq("id", user.id)
  }

  return NextResponse.json({
    connected: true,
    stripeAccountId,
    payoutsEnabled,
    chargesEnabled,
    onboardingCompleted,
    requirementsCurrentlyDue: account.requirements?.currently_due ?? [],
    requirementsPastDue: account.requirements?.past_due ?? [],
  })
}
