import { NextResponse } from "next/server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { resolvePersistedRole } from "@/lib/profile-role"
import { getStripeClient } from "@/lib/payments/stripe"
import { getPaymentsDbClient, toStripeAmount } from "@/lib/payments/escrow"
import { insertInboxNotification } from "@/lib/inbox-notifications"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

// POST /api/admin/orders/[orderId]/refund
export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const role = user ? await resolvePersistedRole(supabase, user) : null
  if (!user || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const { orderId } = await context.params
  const normalizedOrderId = asString(orderId)

  let body: { amount?: number; reason?: string } = {}
  try {
    body = await request.json()
  } catch {
    // empty body — full refund
  }

  // Load order
  const admin = createAdminSupabaseClient()
  const { data: orderRecord, error: orderError } = await admin
    .from("orders")
    .select("id, buyer_id, creator_id, package_price, payment_status, stripe_charge_id, stripe_payment_intent_id, package_title")
    .eq("id", normalizedOrderId)
    .maybeSingle()

  if (orderError || !orderRecord) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 })
  }

  if (orderRecord.payment_status !== "pending" && orderRecord.payment_status !== "paid") {
    return NextResponse.json(
      { error: "Order has not been paid — nothing to refund." },
      { status: 400 }
    )
  }

  const refundAmountCents = body.amount
    ? Math.round(body.amount)
    : toStripeAmount(orderRecord.package_price)

  if (refundAmountCents <= 0 || refundAmountCents > toStripeAmount(orderRecord.package_price)) {
    return NextResponse.json({ error: "Invalid refund amount." }, { status: 400 })
  }

  const chargeId = asString(orderRecord.stripe_charge_id)
  const paymentIntentId = asString(orderRecord.stripe_payment_intent_id)

  const stripe = getStripeClient()
  let stripeRefundId = `dev_refund_${Math.random().toString(36).substring(7)}`

  if (chargeId || paymentIntentId) {
    const refundParams: Parameters<typeof stripe.refunds.create>[0] = {
      amount: refundAmountCents,
      reason: "requested_by_customer",
      metadata: {
        orderId: normalizedOrderId,
        adminId: user.id,
        reason: body.reason?.trim() ?? "",
      },
    }
    if (chargeId) {
      refundParams.charge = chargeId
    } else {
      refundParams.payment_intent = paymentIntentId
    }
    const stripeRefund = await stripe.refunds.create(refundParams)
    stripeRefundId = stripeRefund.id
  }

  // Update order status to refunded
  await admin
    .from("orders")
    .update({ payment_status: "refunded", status: "refunded", updated_at: new Date().toISOString() })
    .eq("id", normalizedOrderId)

  // Create refund record
  await prisma.refund.create({
    data: {
      orderId: normalizedOrderId,
      buyerId: orderRecord.buyer_id,
      creatorId: orderRecord.creator_id,
      amount: refundAmountCents,
      currency: "USD",
      reason: body.reason?.trim() ?? "",
      status: "succeeded",
      stripeRefundId,
      approvedBy: user.id,
    },
  })

  // Log admin action
  await prisma.adminLog.create({
    data: {
      adminId: user.id,
      action: "issue_refund",
      targetType: "order",
      targetId: normalizedOrderId,
      notes: `Refunded $${(refundAmountCents / 100).toFixed(2)}. Stripe refund: ${stripeRefundId}`,
    },
  })

  // Notify buyer and creator
  const dbClient = getPaymentsDbClient()
  try {
    await dbClient.connect()
    await insertInboxNotification(dbClient, {
      userId: orderRecord.buyer_id,
      category: "payment",
      title: "Refund issued",
      body: `A refund of $${(refundAmountCents / 100).toFixed(2)} has been issued for order "${orderRecord.package_title}". It may take 5–10 business days to appear.`,
      actionUrl: "/orders",
    })
    await insertInboxNotification(dbClient, {
      userId: orderRecord.creator_id,
      category: "payment",
      title: "Order refunded",
      body: `Order "${orderRecord.package_title}" has been refunded by admin. $${(refundAmountCents / 100).toFixed(2)} was returned to the buyer.`,
      actionUrl: "/dashboard/creator/orders",
    })
  } finally {
    await dbClient.end().catch(() => {})
  }

  return NextResponse.json({ stripeRefundId, status: "succeeded", amountCents: refundAmountCents })
}
