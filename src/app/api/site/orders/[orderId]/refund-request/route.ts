import { NextResponse } from "next/server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { resolvePersistedRole } from "@/lib/profile-role"
import { getPaymentsDbClient } from "@/lib/payments/escrow"
import { insertInboxNotification } from "@/lib/inbox-notifications"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

// POST /api/site/orders/[orderId]/refund-request — buyer requests a refund
export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const { orderId } = await context.params
  const normalizedOrderId = typeof orderId === "string" ? orderId.trim() : ""

  let body: { reason?: string } = {}
  try {
    body = await request.json()
  } catch {
    // empty body ok
  }

  const reason = body.reason?.trim() ?? ""
  if (!reason) {
    return NextResponse.json({ error: "Please provide a reason for the refund request." }, { status: 400 })
  }

  // Verify order belongs to this buyer
  const admin = createAdminSupabaseClient()
  const { data: orderRecord, error } = await admin
    .from("orders")
    .select("id, buyer_id, creator_id, package_price, payment_status, status, package_title")
    .eq("id", normalizedOrderId)
    .eq("buyer_id", user.id)
    .maybeSingle()

  if (error || !orderRecord) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 })
  }

  if (orderRecord.payment_status === "refunded") {
    return NextResponse.json({ error: "This order has already been refunded." }, { status: 400 })
  }

  if (orderRecord.payment_status === "unpaid" || orderRecord.payment_status === "failed") {
    return NextResponse.json({ error: "Order has not been paid — nothing to refund." }, { status: 400 })
  }

  // Check for duplicate pending refund request
  const existing = await prisma.refund.findFirst({
    where: {
      orderId: normalizedOrderId,
      status: { in: ["requested", "approved"] },
    },
  })

  if (existing) {
    return NextResponse.json(
      { error: "A refund request for this order is already pending." },
      { status: 400 }
    )
  }

  // Create refund request (status = requested, awaiting admin)
  const refund = await prisma.refund.create({
    data: {
      orderId: normalizedOrderId,
      buyerId: user.id,
      creatorId: orderRecord.creator_id,
      amount: orderRecord.package_price * 100, // stored in cents
      currency: "USD",
      reason,
      status: "requested",
    },
  })

  // Notify buyer of receipt
  const dbClient = getPaymentsDbClient()
  try {
    await dbClient.connect()
    await insertInboxNotification(dbClient, {
      userId: user.id,
      category: "payment",
      title: "Refund request submitted",
      body: `Your refund request for "${orderRecord.package_title}" has been submitted and is under review.`,
      actionUrl: "/orders",
    })
  } finally {
    await dbClient.end().catch(() => {})
  }

  return NextResponse.json({ id: refund.id, status: "requested" })
}
