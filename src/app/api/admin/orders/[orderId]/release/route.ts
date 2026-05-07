import { NextResponse } from "next/server"

import { insertInboxNotification } from "@/lib/inbox-notifications"
import { releaseCreatorOrderEscrow, getPaymentsDbClient } from "@/lib/payments/escrow"
import { resolvePersistedRole } from "@/lib/profile-role"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function POST(_: Request, context: { params: Promise<{ orderId: string }> }) {
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
  if (!normalizedOrderId) {
    return NextResponse.json({ error: "Order id is required." }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()
  const { data: orderRecord, error: orderError } = await admin
    .from("orders")
    .select("id, creator_id, buyer_id, status, payment_status")
    .eq("id", normalizedOrderId)
    .maybeSingle()

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 400 })
  }

  if (!orderRecord) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 })
  }

  if (
    (orderRecord.status !== "completed" && orderRecord.status !== "delivered") ||
    orderRecord.payment_status !== "pending"
  ) {
    return NextResponse.json(
      { error: "Only delivered orders with payment on hold can be released." },
      { status: 400 }
    )
  }

  try {
    const released = await releaseCreatorOrderEscrow({
      orderId: normalizedOrderId,
      creatorId: orderRecord.creator_id,
      finalOrderStatus: "completed",
    })

    const notificationClient = getPaymentsDbClient()
    try {
      await notificationClient.connect()
      await insertInboxNotification(notificationClient, {
        userId: orderRecord.creator_id,
        category: "payment",
        title: "Payment released",
        body: `Your payment for order #${normalizedOrderId.slice(0, 8)} has been released by admin.`,
        actionUrl: "/dashboard/creator/transactions",
      })
      await insertInboxNotification(notificationClient, {
        userId: orderRecord.buyer_id,
        category: "order",
        title: "Order payout completed",
        body: `Order #${normalizedOrderId.slice(0, 8)} is fully completed and the creator payout has been released.`,
        actionUrl: "/orders",
      })
    } finally {
      await notificationClient.end().catch(() => { })
    }

    return NextResponse.json({ order: released })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to release creator payout."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
