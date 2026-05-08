import { NextResponse } from "next/server"

import { getStripeClient } from "@/lib/payments/stripe"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { resolvePersistedRole } from "@/lib/profile-role"

export const runtime = "nodejs"

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const role = user ? await resolvePersistedRole(supabase, user) : null
  if (!user || role !== "creator") {
    return NextResponse.json({ error: "Unauthorized. Creator account required." }, { status: 401 })
  }

  // Check if creator already has a Stripe account
  const admin = createAdminSupabaseClient()
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, profile_data")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError || !profile) {
    return NextResponse.json({ error: "Creator profile not found." }, { status: 404 })
  }

  const profileData = (profile.profile_data ?? {}) as Record<string, unknown>
  const creatorData = (profileData.creator ?? {}) as Record<string, unknown>
  const existingAccountId =
    (typeof creatorData.stripeConnectAccountId === "string" && creatorData.stripeConnectAccountId.trim()) || ""

  if (existingAccountId) {
    return NextResponse.json({ stripeAccountId: existingAccountId, alreadyExists: true })
  }

  // Create a new Stripe Express account
  const stripe = getStripeClient()
  const { data: authUser } = await admin.auth.admin.getUserById(user.id)
  const email = authUser.user?.email ?? ""

  const account = await stripe.accounts.create({
    type: "express",
    email: email || undefined,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      userId: user.id,
      platform: "character-market",
    },
  })

  // Persist the Stripe account ID into profile_data.creator
  const updatedCreatorData = {
    ...creatorData,
    stripeConnectAccountId: account.id,
    stripeOnboardingCompleted: false,
    stripePayoutsEnabled: false,
    stripeChargesEnabled: false,
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      profile_data: {
        ...profileData,
        creator: updatedCreatorData,
      },
    })
    .eq("id", user.id)

  if (updateError) {
    // Best-effort: try to delete the Stripe account if profile save fails
    await stripe.accounts.del(account.id).catch(() => {})
    return NextResponse.json({ error: "Failed to save Stripe account to profile." }, { status: 500 })
  }

  return NextResponse.json({ stripeAccountId: account.id, alreadyExists: false })
}
