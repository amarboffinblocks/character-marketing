import { NextResponse } from "next/server"

import { getStripeClient } from "@/lib/payments/stripe"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { resolvePersistedRole } from "@/lib/profile-role"
import { readCreatorStripeAccountId, getPaymentsDbClient, toStripeAmount } from "@/lib/payments/escrow"
import { insertInboxNotification } from "@/lib/inbox-notifications"

export const runtime = "nodejs"

// GET /api/creator/payouts/requests — creator's own payout request history
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
  const { data, error } = await admin
    .from("payout_requests")
    .select("*")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ requests: data ?? [] })
}

// POST /api/creator/payouts/requests — creator requests a payout
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const role = user ? await resolvePersistedRole(supabase, user) : null
  if (!user || role !== "creator") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  let body: { amount?: number; notes?: string } = {}
  try {
    body = await request.json()
  } catch {
    // empty body is fine
  }

  const amount = typeof body.amount === "number" ? Math.round(body.amount) : 0
  if (amount <= 0) {
    return NextResponse.json({ error: "Amount must be greater than 0." }, { status: 400 })
  }

  // Verify the creator has a connected Stripe account with payouts enabled
  const admin = createAdminSupabaseClient()
  const { data: profile } = await admin
    .from("profiles")
    .select("id, profile_data")
    .eq("id", user.id)
    .maybeSingle()

  const profileData = (profile?.profile_data ?? {}) as Record<string, unknown>
  const stripeAccountId = readCreatorStripeAccountId(profileData)
  const creatorData = (profileData.creator ?? {}) as Record<string, unknown>
  const payoutsEnabled = creatorData.stripePayoutsEnabled === true
  const onboardingCompleted = creatorData.stripeOnboardingCompleted === true

  if (!stripeAccountId || !payoutsEnabled || !onboardingCompleted) {
    return NextResponse.json(
      {
        error:
          "Stripe payout account not fully set up. Complete Connect onboarding before requesting a payout.",
      },
      { status: 400 }
    )
  }

  // Check creator has available balance (completed orders where payment is 'pending' release)
  const dbClient = getPaymentsDbClient()
  try {
    await dbClient.connect()

    // Sum of released (paid) amounts minus already-requested amounts
    const balanceResult = await dbClient.query(
      `select
         coalesce(sum(pt.amount), 0) as total_released
       from public.payment_transactions pt
       where pt.creator_id = $1
         and pt.transaction_type = 'release'
         and pt.status = 'succeeded'`,
      [user.id]
    )

    const alreadyRequestedResult = await dbClient.query(
      `select coalesce(sum(amount), 0) as total_requested
       from public.payout_requests
       where creator_id = $1
         and status in ('pending', 'approved')`,
      [user.id]
    )

    const totalReleased = Number(balanceResult.rows[0]?.total_released ?? 0)
    const totalRequested = Number(alreadyRequestedResult.rows[0]?.total_requested ?? 0)
    const availableBalance = totalReleased - totalRequested

    if (amount > availableBalance) {
      return NextResponse.json(
        {
          error: `Requested amount ($${(amount / 100).toFixed(2)}) exceeds available balance ($${(availableBalance / 100).toFixed(2)}).`,
        },
        { status: 400 }
      )
    }

    // Insert payout request
    const insertResult = await dbClient.query(
      `insert into public.payout_requests
         (creator_id, amount, currency, status, notes)
       values ($1, $2, 'USD', 'pending', $3)
       returning id`,
      [user.id, amount, body.notes?.trim() ?? ""]
    )

    const payoutRequestId = insertResult.rows[0]?.id as string

    // Notify admin (insert into inbox for all admins — simplified: use a fixed admin notification)
    await insertInboxNotification(dbClient, {
      userId: user.id, // Creator confirmation
      category: "payment",
      title: "Payout requested",
      body: `Your payout request of $${(amount / 100).toFixed(2)} has been submitted and is pending admin approval.`,
      actionUrl: "/dashboard/creator/earnings",
    })

    return NextResponse.json({ id: payoutRequestId, status: "pending" })
  } finally {
    await dbClient.end().catch(() => {})
  }
}
