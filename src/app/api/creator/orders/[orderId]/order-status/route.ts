import { NextResponse } from "next/server"
import { z } from "zod"

import { updateCreatorOrderStatus } from "@/features/creator/orders/creator-orders"
import { insertInboxNotification } from "@/lib/inbox-notifications"
import { getOrdersDbClient, replaceOrderDeliverables } from "@/lib/order-deliveries"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const assetSchema = z.object({
  assetType: z.enum(["character", "persona", "lorebook", "avatar", "background"]),
  assetId: z.string().uuid(),
})

const payloadSchema = z.object({
  status: z.enum(["pending", "processing", "on_hold", "reviewing", "delivered", "completed"]),
  deliveryNote: z.string().trim().max(4000).optional(),
  assets: z.array(assetSchema).optional(),
})

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function buildBuyerOrderNotification(input: {
  orderId: string
  packageTitle: string
  status: "pending" | "processing" | "on_hold" | "reviewing" | "delivered" | "completed"
}) {
  const orderLabel = input.packageTitle || `order #${input.orderId.slice(0, 8)}`

  if (input.status === "pending") {
    return {
      title: "Order update",
      body: `Your creator updated ${orderLabel}. The order is currently pending.`,
      actionUrl: "/orders",
    }
  }

  if (input.status === "processing") {
    return {
      title: "Work has started",
      body: `Your creator started working on ${orderLabel}.`,
      actionUrl: "/orders",
    }
  }

  if (input.status === "on_hold") {
    return {
      title: "Order update",
      body: `Your creator paused ${orderLabel} for now. Open the order to review the latest status.`,
      actionUrl: "/orders",
    }
  }

  if (input.status === "completed") {
    return {
      title: "Order marked complete",
      body: `Your creator marked ${orderLabel} as complete.`,
      actionUrl: "/orders",
    }
  }

  if (input.status === "reviewing") {
    return {
      title: "Order update",
      body: `Your creator updated ${orderLabel}. Review is now the next step.`,
      actionUrl: `/orders/${input.orderId}/preview`,
    }
  }

  if (input.status === "delivered") {
    return {
      title: "Order delivered",
      body: `Your creator delivered ${orderLabel}. Review it from your orders page.`,
      actionUrl: `/orders/${input.orderId}/preview`,
    }
  }

  return null
}

export async function PATCH(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const { orderId } = await context.params
  const normalizedOrderId = asString(orderId)
  if (!normalizedOrderId) {
    return NextResponse.json({ error: "Order id is required." }, { status: 400 })
  }

  const body = await request.json()
  const parsed = payloadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 })
  }

  try {
    if (parsed.data.status === "reviewing") {
      const result = await replaceOrderDeliverables({
        orderId: normalizedOrderId,
        creatorId: user.id,
        deliveryNote: parsed.data.deliveryNote ?? "",
        assets: parsed.data.assets ?? [],
        targetOrderStatus: "delivered",
      })

      const notificationClient = getOrdersDbClient()
      try {
        await notificationClient.connect()
        await insertInboxNotification(notificationClient, {
          userId: result.buyerId,
          category: "order",
          title: "Work ready to review",
          body: `Your creator attached ${result.deliverables.length} asset${result.deliverables.length === 1 ? "" : "s"} for order #${result.orderId.slice(0, 8)}. Open the preview to approve or request changes.`,
          actionUrl: `/orders/${result.orderId}/preview`,
        })
      } finally {
        await notificationClient.end().catch(() => { })
      }

      return NextResponse.json({
        order: {
          id: result.orderId,
          status: "reviewing" as const,
          paymentStatus: result.paymentStatus,
        },
      })
    }

    const updated = await updateCreatorOrderStatus({
      orderId: normalizedOrderId,
      creatorId: user.id,
      status: parsed.data.status,
    })

    const notification = buildBuyerOrderNotification({
      orderId: normalizedOrderId,
      packageTitle: updated.packageTitle,
      status: parsed.data.status,
    })

    if (notification) {
      const notificationClient = getOrdersDbClient()
      try {
        await notificationClient.connect()
        await insertInboxNotification(notificationClient, {
          userId: updated.buyerId,
          category: "order",
          title: notification.title,
          body: notification.body,
          actionUrl: notification.actionUrl,
        })
      } finally {
        await notificationClient.end().catch(() => { })
      }
    }

    return NextResponse.json({ order: updated })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update order."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
