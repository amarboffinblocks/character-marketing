import { NextResponse } from "next/server"
import { z } from "zod"

import { insertInboxNotification } from "@/lib/inbox-notifications"
import {
  type DeliverableAssetType,
  listCreatorDeliverableOptions,
  replaceOrderDeliverables,
  getOrdersDbClient,
} from "@/lib/order-deliveries"
import { releaseCreatorOrderEscrow } from "@/lib/payments/escrow"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const payloadSchema = z.object({
  deliveryNote: z.string().trim().max(4000).optional(),
  assets: z
    .array(
      z.object({
        assetType: z.enum(["character", "persona", "lorebook", "avatar", "background"]),
        assetId: z.string().uuid(),
      })
    )
    .min(1),
})

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function GET(_: Request, context: { params: Promise<{ requestId: string }> }) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const options = await listCreatorDeliverableOptions(user.id)
  return NextResponse.json({ options })
}

export async function POST(request: Request, context: { params: Promise<{ requestId: string }> }) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const { requestId } = await context.params
  const normalizedOrderId = asString(requestId)
  if (!normalizedOrderId) {
    return NextResponse.json({ error: "Order id is required." }, { status: 400 })
  }

  const body = await request.json().catch(() => ({}))
  const parsed = payloadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid delivery payload." }, { status: 400 })
  }

  try {
    const statusClient = getOrdersDbClient()
    let shouldReleaseOnDeliver = false
    try {
      await statusClient.connect()
      const statusResult = await statusClient.query(
        `select status, payment_status
         from public.orders
         where id = $1 and creator_id = $2
         limit 1`,
        [normalizedOrderId, user.id]
      )
      const row = statusResult.rows[0] as { status?: string; payment_status?: string } | undefined
      shouldReleaseOnDeliver = row?.status === "approved" && row?.payment_status === "pending"
    } finally {
      await statusClient.end().catch(() => {})
    }

    const result = await replaceOrderDeliverables({
      orderId: normalizedOrderId,
      creatorId: user.id,
      deliveryNote: parsed.data.deliveryNote ?? "",
      assets: parsed.data.assets as Array<{ assetType: DeliverableAssetType; assetId: string }>,
    })

    let resolvedStatus: "delivered" | "approved" = "delivered"
    let resolvedPaymentStatus: "unpaid" | "pending" | "paid" | "failed" | "refunded" =
      (result.paymentStatus as "unpaid" | "pending" | "paid" | "failed" | "refunded") ?? "pending"

    if (shouldReleaseOnDeliver) {
      const released = await releaseCreatorOrderEscrow({
        orderId: normalizedOrderId,
        creatorId: user.id,
      })
      resolvedStatus = "delivered"
      resolvedPaymentStatus = released.paymentStatus
    }

    const notificationClient = getOrdersDbClient()
    try {
      await notificationClient.connect()
      await insertInboxNotification(notificationClient, {
        userId: result.buyerId,
        category: "order",
        title: "Order delivered",
        body: `Your creator delivered ${result.deliverables.length} asset${result.deliverables.length === 1 ? "" : "s"} for order #${result.orderId.slice(0, 8)}. Review the preview and approve or request changes.`,
        actionUrl: `/orders/${result.orderId}/preview`,
      })
      await insertInboxNotification(notificationClient, {
        userId: user.id,
        category: "order",
        title: "Delivery submitted",
        body: `You submitted ${result.deliverables.length} asset${result.deliverables.length === 1 ? "" : "s"} for order #${result.orderId.slice(0, 8)}.`,
        actionUrl: "/dashboard/creator/orders",
      })
      if (shouldReleaseOnDeliver) {
        await insertInboxNotification(notificationClient, {
          userId: user.id,
          category: "payment",
          title: "Payout released",
          body: `Escrow was released to your payout account for order #${result.orderId.slice(0, 8)}.`,
          actionUrl: "/dashboard/creator/transactions",
        })
        await insertInboxNotification(notificationClient, {
          userId: result.buyerId,
          category: "payment",
          title: "Order payout completed",
          body: `Order #${result.orderId.slice(0, 8)} payout was released after delivery.`,
          actionUrl: "/orders",
        })
      }
    } finally {
      await notificationClient.end().catch(() => {})
    }

    return NextResponse.json({
      success: true,
      order: {
        id: result.orderId,
        status: resolvedStatus,
        paymentStatus: resolvedPaymentStatus,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit delivery."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
