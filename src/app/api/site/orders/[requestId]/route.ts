import { NextResponse } from "next/server"
import pg from "pg"

import {
  createStripeCheckoutSessionForOrder,
  getPaymentsDbClient,
  releaseCreatorOrderEscrow,
} from "@/lib/payments/escrow"
import { createServerSupabaseClient } from "@/lib/supabase/server"

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
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

  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("Server misconfigured.")
  }

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
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

export async function POST(request: Request, context: { params: Promise<{ requestId: string }> }) {
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

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const client = getPaymentsDbClient()
  try {
    await client.connect()
    await client.query("begin")

    const orderResult = await client.query(
      `select id, buyer_id, creator_id, package_title, package_price, payment_status, status, transfer_group
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
          package_title: string
          package_price: number
          payment_status: "unpaid" | "pending" | "paid" | "failed" | "refunded"
          status: string
          transfer_group: string | null
        }
      | undefined

    if (!order) {
      await client.query("rollback")
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    if (order.payment_status === "pending" || order.payment_status === "paid") {
      await client.query("commit")
      return NextResponse.json({
        success: true,
        order: {
          id: order.id,
          paymentStatus: order.payment_status,
          status: order.status,
        },
      })
    }

    const { session: checkoutSession, transferGroup } = await createStripeCheckoutSessionForOrder({
      order,
      buyerEmail: session?.user.email,
      request,
    })

    await client.query(
      `update public.orders
       set
         transfer_group = $2,
         stripe_checkout_session_id = $3,
         updated_at = now()
       where id = $1`,
      [order.id, transferGroup, checkoutSession.id]
    )

    const existingCheckoutResult = await client.query(
      `update public.payment_transactions
       set
         provider_reference = $2,
         status = $3,
         transfer_group = $4,
         notes = $5
      where checkout_session_id = $1
      returning id`,
      [
        checkoutSession.id,
        checkoutSession.id,
        "pending",
        transferGroup,
        "Buyer started Stripe Checkout for escrow funding.",
      ]
    )

    if (!existingCheckoutResult.rows[0]) {
      await client.query(
        `insert into public.payment_transactions
           (
             transaction_type,
             order_id,
             buyer_id,
             creator_id,
             amount,
             currency,
             payment_method,
             provider,
             provider_reference,
             status,
             checkout_session_id,
             transfer_group,
             notes
           )
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          "charge",
          order.id,
          order.buyer_id,
          order.creator_id,
          order.package_price,
          "USD",
          "card",
          "stripe",
          checkoutSession.id,
          "pending",
          checkoutSession.id,
          transferGroup,
          "Buyer started Stripe Checkout for escrow funding.",
        ]
      )
    }

    await client.query("commit")
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        paymentStatus: order.payment_status,
        status: order.status,
      },
      checkoutUrl: checkoutSession.url,
    })
  } catch (error) {
    await client.query("rollback").catch(() => {})
    const message = error instanceof Error ? error.message : "Unable to process payment."
    return NextResponse.json({ error: message }, { status: 400 })
  } finally {
    await client.end().catch(() => {})
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ requestId: string }> }) {
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

  const payload = (await request.json().catch(() => ({}))) as { action?: unknown; message?: unknown }
  const action = asString(payload.action)
  const message = asString(payload.message)

  if (action !== "approve" && action !== "request_update") {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 })
  }

  const client = getPaymentsDbClient()
  try {
    await client.connect()
    const orderResult = await client.query(
      `select id, buyer_id, creator_id, status, payment_status, request_snapshot
       from public.orders
       where id = $1 and buyer_id = $2
       limit 1`,
      [normalizedOrderId, user.id]
    )
    const order = orderResult.rows[0] as
      | {
          id: string
          buyer_id: string
          creator_id: string
          status: string
          payment_status: "unpaid" | "pending" | "paid" | "failed" | "refunded"
          request_snapshot: any
        }
      | undefined
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    if (action === "request_update") {
      const updatedSnapshot = typeof order.request_snapshot === 'object' && order.request_snapshot !== null 
        ? { ...order.request_snapshot, revision_message: message }
        : { revision_message: message }

      await client.query(
        `update public.orders
         set status = 'in_progress', request_snapshot = $2, updated_at = now()
         where id = $1`,
        [order.id, JSON.stringify(updatedSnapshot)]
      )
      return NextResponse.json({
        success: true,
        order: { id: order.id, status: "in_progress", paymentStatus: order.payment_status },
      })
    }

    if (order.payment_status !== "pending") {
      return NextResponse.json(
        { error: "Escrow must be funded before approval and payout release." },
        { status: 400 }
      )
    }

    await client.end().catch(() => {})
    const updated = await releaseCreatorOrderEscrow({
      orderId: order.id,
      creatorId: order.creator_id,
    })

    return NextResponse.json({
      success: true,
      order: { id: updated.id, status: "completed", paymentStatus: updated.paymentStatus },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update order."
    return NextResponse.json({ error: message }, { status: 400 })
  } finally {
    await client.end().catch(() => {})
  }
}
