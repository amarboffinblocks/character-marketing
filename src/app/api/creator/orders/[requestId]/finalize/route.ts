import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getOrdersDbClient, cloneOrderAssetsToBuyer } from "@/lib/order-deliveries"
import { insertInboxNotification } from "@/lib/inbox-notifications"

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function POST(_: Request, context: { params: Promise<{ requestId: string }> }) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { requestId } = await context.params
  const normalizedRequestId = asString(requestId)

  const client = getOrdersDbClient()
  try {
    await client.connect()
    
    // 1. Verify order status and ownership
    const orderResult = await client.query(
      `select id, buyer_id, creator_id, status, payment_status
       from public.orders
       where id = $1 and creator_id = $2
       limit 1`,
      [normalizedRequestId, user.id]
    )
    
    const order = orderResult.rows[0] as {
      id: string
      buyer_id: string
      creator_id: string
      status: string
      payment_status: string
    } | undefined

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    if (order.status !== "approved") {
      return NextResponse.json({ error: "Order must be approved by the buyer before final delivery." }, { status: 400 })
    }

    // 2. Clone assets to buyer inventory
    await cloneOrderAssetsToBuyer({
      orderId: order.id,
      buyerId: order.buyer_id,
    })

    // 3. Mark as delivered to buyer while payment remains on hold for admin release.
    await client.query(
      `update public.orders set status = 'completed', updated_at = now() where id = $1`,
      [order.id]
    )

    // 4. Notifications
    const notificationClient = getOrdersDbClient()
    try {
      await notificationClient.connect()
      await insertInboxNotification(notificationClient, {
        userId: order.buyer_id,
        category: "order",
        title: "Final delivery received",
        body: `Order #${order.id.slice(0, 8)} has been delivered to your inventory.`,
        actionUrl: "/orders",
      })
      await insertInboxNotification(notificationClient, {
        userId: user.id,
        category: "payment",
        title: "Payment release pending",
        body: `Your final delivery for order #${order.id.slice(0, 8)} is complete. Admin will release your payment shortly.`,
        actionUrl: "/dashboard/creator/transactions",
      })

      const adminResult = await notificationClient.query(
        `select id from public.profiles where role = 'admin'`
      )
      for (const row of adminResult.rows as Array<{ id?: string }>) {
        if (!row.id) continue
        await insertInboxNotification(notificationClient, {
          userId: row.id,
          category: "payment",
          title: "Delivered order ready for payout review",
          body: `Order #${order.id.slice(0, 8)} was delivered to the buyer. Review it and release the creator payout manually.`,
          actionUrl: "/dashboard/admin/orders",
        })
      }
    } finally {
      await notificationClient.end().catch(() => {})
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: "completed",
        paymentStatus: order.payment_status
      }
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to finalize order."
    return NextResponse.json({ error: message }, { status: 400 })
  } finally {
    await client.end().catch(() => {})
  }
}
