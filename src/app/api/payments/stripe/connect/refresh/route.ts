import { NextResponse } from "next/server"

import { getStripeClient } from "@/lib/payments/stripe"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

/**
 * GET — If creator's onboarding was incomplete or the Account Link expired,
 *        generate a fresh Account Link and redirect them back to Stripe.
 */
export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const baseUrl = (() => {
    const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
    if (configured) return configured.replace(/\/+$/, "")
    const url = new URL(request.url)
    return `${url.protocol}//${url.host}`
  })()

  if (!user) {
    return NextResponse.redirect(`${baseUrl}/sign-in?next=/dashboard/creator/profile`)
  }

  // Read the creator's profile_data to find the saved account ID
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
    // No account saved — send them back to the profile page
    return NextResponse.redirect(
      `${baseUrl}/dashboard/creator/profile?stripe=no_account`
    )
  }

  try {
    const stripe = getStripeClient()
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      type: "account_onboarding",
      return_url: `${baseUrl}/dashboard/creator/stripe-connect/return`,
      refresh_url: `${baseUrl}/api/payments/stripe/connect/refresh`,
    })

    return NextResponse.redirect(accountLink.url)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create onboarding link."
    return NextResponse.redirect(
      `${baseUrl}/dashboard/creator/profile?stripe=error&message=${encodeURIComponent(message)}`
    )
  }
}
