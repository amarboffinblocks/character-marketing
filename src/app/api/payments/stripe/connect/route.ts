import { NextResponse } from "next/server"

import { getStripeClient } from "@/lib/payments/stripe"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

/**
 * GET  — Return the current Stripe Connect status for the logged-in creator.
 * POST — Create (or re-use) a Stripe Express connected account and return an
 *         Account Link URL so the creator can complete onboarding.
 */

function resolveBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configured) return configured.replace(/\/+$/, "")
  const url = new URL(request.url)
  return `${url.protocol}//${url.host}`
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Read the creator's profile_data
  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_data")
    .eq("id", user.id)
    .maybeSingle()

  const profileData = (profile?.profile_data as Record<string, unknown>) ?? {}
  const creatorData = (profileData.creator as Record<string, unknown>) ?? {}
  const stripeAccountId =
    typeof creatorData.stripeConnectAccountId === "string"
      ? creatorData.stripeConnectAccountId.trim()
      : ""

  if (!stripeAccountId) {
    return NextResponse.json({
      connected: false,
      accountId: null,
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
    })
  }

  // Fetch the account status from Stripe
  try {
    const stripe = getStripeClient()
    const account = await stripe.accounts.retrieve(stripeAccountId)

    return NextResponse.json({
      connected: true,
      accountId: account.id,
      chargesEnabled: account.charges_enabled ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
      detailsSubmitted: account.details_submitted ?? false,
    })
    } catch {
      // Account may have been deleted or invalid
      return NextResponse.json({
        connected: false,
        accountId: stripeAccountId,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        error: "Unable to verify Stripe account. It may be invalid.",
      })
    }
  } catch (err: any) {
    console.error("[STRIPE_CONNECT_GET_ERROR]", err)
    return NextResponse.json(
      {
        error: "Internal server error while fetching Stripe status.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const stripe = getStripeClient()
  const baseUrl = resolveBaseUrl(request)

  // Read the creator's current profile_data
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("profile_data")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json(
      { error: "Unable to load profile.", details: profileError.message },
      { status: 400 }
    )
  }

  const profileData = (profile?.profile_data as Record<string, unknown>) ?? {}
  const creatorData = (profileData.creator as Record<string, unknown>) ?? {}
  let stripeAccountId =
    typeof creatorData.stripeConnectAccountId === "string"
      ? creatorData.stripeConnectAccountId.trim()
      : ""

  // If the creator already has an account, verify it exists on Stripe
  if (stripeAccountId) {
    try {
      await stripe.accounts.retrieve(stripeAccountId)
    } catch {
      // Account doesn't exist anymore — clear it so we create a new one
      stripeAccountId = ""
    }
  }

  // Create a new Express connected account if needed
  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email ?? undefined,
      metadata: {
        userId: user.id,
        platform: "character-market",
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    })

    stripeAccountId = account.id

    // Save the account ID to the creator's profile_data
    const updatedCreatorData = {
      ...creatorData,
      stripeConnectAccountId: stripeAccountId,
    }
    const updatedProfileData = {
      ...profileData,
      creator: updatedCreatorData,
    }

    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        profile_data: updatedProfileData,
      },
      { onConflict: "id" }
    )

    if (upsertError) {
      return NextResponse.json(
        { error: "Failed to save Stripe account to profile.", details: upsertError.message },
        { status: 400 }
      )
    }
  }

  // Create an Account Link for the onboarding flow
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    type: "account_onboarding",
    return_url: `${baseUrl}/dashboard/creator/stripe-connect/return`,
    refresh_url: `${baseUrl}/api/payments/stripe/connect/refresh`,
  })

    return NextResponse.json({
      url: accountLink.url,
      accountId: stripeAccountId,
    })
  } catch (err: any) {
    console.error("[STRIPE_CONNECT_POST_ERROR]", err)
    
    const isConnectSignupError = err?.message?.includes("signed up for Connect")

    return NextResponse.json(
      {
        error: isConnectSignupError 
          ? "Your Stripe account is not yet fully configured for Connect. Please complete your Platform Profile in the Stripe Dashboard." 
          : "Internal server error during Stripe Connect.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    )
  }
}
