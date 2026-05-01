import { NextResponse } from "next/server"
import pg from "pg"

import { createServerSupabaseClient } from "@/lib/supabase/server"

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function getDbClient() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("Server misconfigured.")
  }
  return new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
}

export async function DELETE(_: Request, context: { params: Promise<{ requestId: string }> }) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { requestId } = await context.params
  const normalizedRequestId = asString(requestId)
  if (!normalizedRequestId) {
    return NextResponse.json({ error: "requestId is required." }, { status: 400 })
  }

  const client = getDbClient()
  try {
    await client.connect()
    const result = await client.query(
      `delete from public.requests
       where id = $1 and requester_id = $2
       returning id`,
      [normalizedRequestId, user.id]
    )

    if (!result.rows[0]) {
      return NextResponse.json({ error: "Order request not found." }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete order request."
    return NextResponse.json({ error: message }, { status: 400 })
  } finally {
    await client.end().catch(() => {})
  }
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
  const normalizedOrderId = asString(requestId)
  if (!normalizedOrderId) {
    return NextResponse.json({ error: "orderId is required." }, { status: 400 })
  }

  const client = getDbClient()
  try {
    await client.connect()
    await client.query("begin")

    const orderResult = await client.query(
      `select id, buyer_id, creator_id, package_price, payment_status, status
       from public.orders
       where id = $1 and buyer_id = $2
       for update`,
      [normalizedOrderId, user.id]
    )
    const order = orderResult.rows[0] as
      | {
          id: string
          buyer_id: string
          creator_id: string
          package_price: number
          payment_status: "unpaid" | "pending" | "paid" | "failed" | "refunded"
          status: string
        }
      | undefined

    if (!order) {
      await client.query("rollback")
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    if (order.payment_status === "paid") {
      await client.query("commit")
      return NextResponse.json({
        success: true,
        order: {
          id: order.id,
          paymentStatus: "paid",
          status: order.status,
        },
      })
    }

    await client.query(
      `insert into public.payment_transactions
         (order_id, buyer_id, creator_id, amount, currency, payment_method, provider, provider_reference, status, notes)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        order.id,
        order.buyer_id,
        order.creator_id,
        order.package_price,
        "USD",
        "card",
        "manual",
        `txn-${Date.now()}`,
        "succeeded",
        "Buyer paid from orders page.",
      ]
    )

    const updateResult = await client.query(
      `update public.orders
       set
         payment_status = 'paid',
         status = case when status = 'pending_payment' then 'funded' else status end,
         updated_at = now()
       where id = $1
       returning id, payment_status, status`,
      [order.id]
    )
    const updated = updateResult.rows[0] as { id: string; payment_status: string; status: string } | undefined

    await client.query("commit")
    return NextResponse.json({
      success: true,
      order: {
        id: updated?.id ?? order.id,
        paymentStatus: updated?.payment_status ?? "paid",
        status: updated?.status ?? order.status,
      },
    })
  } catch (error) {
    await client.query("rollback").catch(() => {})
    const message = error instanceof Error ? error.message : "Unable to process payment."
    return NextResponse.json({ error: message }, { status: 400 })
  } finally {
    await client.end().catch(() => {})
  }
}
