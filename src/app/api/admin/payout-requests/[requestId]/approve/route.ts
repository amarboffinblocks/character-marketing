import { NextResponse } from "next/server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { resolvePersistedRole } from "@/lib/profile-role"
import { getStripeClient } from "@/lib/payments/stripe"
import {
  getPaymentsDbClient,
  readCreatorStripeAccountId,
  toStripeAmount,
  buildTransferGroup,
} from "@/lib/payments/escrow"
import { insertInboxNotification } from "@/lib/inbox-notifications"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

// POST /api/admin/payout-requests/[requestId]/approve
export async function POST(
  request: Request,
  context: { params: Promise<{ requestId: string }> }
) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const role = user ? await resolvePersistedRole(supabase, user) : null
  if (!user || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const { requestId } = await context.params
  const normalizedId = asString(requestId)
  if (!normalizedId) {
    return NextResponse.json({ error: "Request ID is required." }, { status: 400 })
  }

  // Fetch the payout request
  const payoutRequest = await prisma.payoutRequest.findUnique({
    where: { id: normalizedId },
  })

  if (!payoutRequest) {
    return NextResponse.json({ error: "Payout request not found." }, { status: 404 })
  }

  if (payoutRequest.status !== "pending") {
    return NextResponse.json(
      { error: `Cannot approve a request with status '${payoutRequest.status}'.` },
      { status: 400 }
    )
  }

  // Fetch creator's Stripe account
  const admin = createAdminSupabaseClient()
  const { data: profile } = await admin
    .from("profiles")
    .select("id, profile_data")
    .eq("id", payoutRequest.creatorId)
    .maybeSingle()

  const profileData = (profile?.profile_data ?? {}) as Record<string, unknown>
  const stripeAccountId = readCreatorStripeAccountId(profileData)

  const isDev = process.env.NODE_ENV === "development"
  if (!stripeAccountId && !isDev) {
    return NextResponse.json(
      { error: "Creator has no connected Stripe account." },
      { status: 400 }
    )
  }

  // Create Stripe Transfer
  const stripe = getStripeClient()
  let transferId = `dev_payout_${Math.random().toString(36).substring(7)}`

  if (stripeAccountId) {
    const transfer = await stripe.transfers.create({
      amount: payoutRequest.amount,
      currency: payoutRequest.currency.toLowerCase(),
      destination: stripeAccountId,
      transfer_group: buildTransferGroup(`payout_${normalizedId}`),
      metadata: {
        payoutRequestId: normalizedId,
        creatorId: payoutRequest.creatorId,
        platform: "character-market",
      },
    })
    transferId = transfer.id
  }

  // Update payout request to approved + paid
  await prisma.payoutRequest.update({
    where: { id: normalizedId },
    data: {
      status: "paid",
      stripeTransferId: transferId,
      approvedBy: user.id,
    },
  })

  // Log admin action
  await prisma.adminLog.create({
    data: {
      adminId: user.id,
      action: "approve_payout",
      targetType: "payout_request",
      targetId: normalizedId,
      notes: `Approved payout of $${(payoutRequest.amount / 100).toFixed(2)}. Transfer: ${transferId}`,
    },
  })

  // Notify creator
  const dbClient = getPaymentsDbClient()
  try {
    await dbClient.connect()
    await insertInboxNotification(dbClient, {
      userId: payoutRequest.creatorId,
      category: "payment",
      title: "Payout approved",
      body: `Your payout of $${(payoutRequest.amount / 100).toFixed(2)} has been approved and transferred to your Stripe account.`,
      actionUrl: "/dashboard/creator/earnings",
    })
  } finally {
    await dbClient.end().catch(() => {})
  }

  return NextResponse.json({ transferId, status: "paid" })
}
