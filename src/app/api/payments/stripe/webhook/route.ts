import { NextResponse } from "next/server"
import type Stripe from "stripe"

import { buildTransferGroup, getPaymentsDbClient } from "@/lib/payments/escrow"
import { insertInboxNotification } from "@/lib/inbox-notifications"
import { getStripeClient } from "@/lib/payments/stripe"

export const runtime = "nodejs"

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

async function markCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId =
    normalizeText(session.metadata?.orderId) || normalizeText(session.client_reference_id)

  if (!orderId) {
    return
  }

  const stripe = getStripeClient()
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : ""
  const paymentIntent = paymentIntentId
    ? await stripe.paymentIntents.retrieve(paymentIntentId)
    : null
  const chargeId =
    paymentIntent && typeof paymentIntent.latest_charge === "string"
      ? paymentIntent.latest_charge
      : ""
  const transferGroup =
    normalizeText(session.metadata?.transferGroup) ||
    normalizeText(paymentIntent?.transfer_group) ||
    buildTransferGroup(orderId)

  const client = getPaymentsDbClient()
  try {
    await client.connect()
    await client.query("begin")

    await client.query(
      `update public.orders
       set
         payment_status = 'pending',
         status = case when status = 'pending_payment' then 'funded' else status end,
         stripe_checkout_session_id = $2,
         stripe_payment_intent_id = $3,
         stripe_charge_id = $4,
         transfer_group = $5,
         escrow_funded_at = coalesce(escrow_funded_at, now()),
         updated_at = now()
       where id = $1`,
      [orderId, session.id, paymentIntentId, chargeId, transferGroup]
    )

    const updatedResult = await client.query(
      `update public.payment_transactions
       set
         provider = 'stripe',
         provider_reference = $2,
         status = 'succeeded',
         checkout_session_id = $3,
         payment_intent_id = $4,
         charge_id = $5,
         transfer_group = $6,
         notes = 'Buyer funded escrow through Stripe Checkout.'
       where checkout_session_id = $3 and transaction_type = 'charge'
       returning id`,
      [orderId, paymentIntentId || session.id, session.id, paymentIntentId, chargeId, transferGroup]
    )

    if (!updatedResult.rows[0]) {
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
             payment_intent_id,
             charge_id,
             transfer_group,
             notes
           )
         select
           'charge',
           o.id,
           o.buyer_id,
           o.creator_id,
           o.package_price,
           'USD',
           'card',
           'stripe',
           $2,
           'succeeded',
           $3,
           $4,
           $5,
           $6,
           'Buyer funded escrow through Stripe Checkout.'
         from public.orders o
         where o.id = $1`,
        [orderId, paymentIntentId || session.id, session.id, paymentIntentId, chargeId, transferGroup]
      )
    }

    const orderNotificationResult = await client.query(
      `select creator_id, package_title
       from public.orders
       where id = $1
       limit 1`,
      [orderId]
    )
    const orderNotificationRow = orderNotificationResult.rows[0] as
      | { creator_id: string; package_title: string }
      | undefined

    if (orderNotificationRow) {
      await insertInboxNotification(client, {
        userId: orderNotificationRow.creator_id,
        category: "payment",
        title: "Order funded",
        body: `The buyer paid for ${orderNotificationRow.package_title || `order #${orderId.slice(0, 8)}`}. You can start work now.`,
        actionUrl: "/dashboard/creator/orders",
      })
    }

    await client.query("commit")
  } catch (error) {
    await client.query("rollback").catch(() => {})
    throw error
  } finally {
    await client.end().catch(() => {})
  }
}

async function markCheckoutFailed(input: { orderId?: string; checkoutSessionId?: string; paymentIntentId?: string }) {
  const orderId = normalizeText(input.orderId)
  const checkoutSessionId = normalizeText(input.checkoutSessionId)
  const paymentIntentId = normalizeText(input.paymentIntentId)
  if (!orderId && !checkoutSessionId && !paymentIntentId) {
    return
  }

  const client = getPaymentsDbClient()
  try {
    await client.connect()
    await client.query("begin")

    if (orderId) {
      await client.query(
        `update public.orders
         set payment_status = 'failed', updated_at = now()
         where id = $1 and payment_status = 'unpaid'`,
        [orderId]
      )
    }

    await client.query(
      `update public.payment_transactions
       set status = 'failed', notes = 'Stripe Checkout was not completed.'
       where transaction_type = 'charge'
         and (
           ($1 <> '' and checkout_session_id = $1)
           or ($2 <> '' and payment_intent_id = $2)
         )`,
      [checkoutSessionId, paymentIntentId]
    )

    await client.query("commit")
  } catch (error) {
    await client.query("rollback").catch(() => {})
    throw error
  } finally {
    await client.end().catch(() => {})
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing Stripe webhook configuration." }, { status: 400 })
  }

  const body = await request.text()

  let event: Stripe.Event
  try {
    event = getStripeClient().webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify Stripe signature."
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    if (event.type === "checkout.session.completed") {
      await markCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session
      await markCheckoutFailed({
        orderId: normalizeText(session.metadata?.orderId) || normalizeText(session.client_reference_id),
        checkoutSessionId: session.id,
        paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : "",
      })
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await markCheckoutFailed({
        orderId: normalizeText(paymentIntent.metadata?.orderId),
        paymentIntentId: paymentIntent.id,
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process Stripe webhook."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
