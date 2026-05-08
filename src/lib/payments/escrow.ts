import pg from "pg"

import { insertInboxNotification } from "@/lib/inbox-notifications"
import { getStripeClient } from "@/lib/payments/stripe"

export type EscrowPaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded"
export type EscrowTransactionStatus = "pending" | "succeeded" | "failed" | "refunded"
export type EscrowTransactionType = "charge" | "release" | "refund"

type OrderCheckoutRow = {
  id: string
  buyer_id: string
  creator_id: string
  package_title: string
  package_price: number
  payment_status: EscrowPaymentStatus
  status: string
  transfer_group: string | null
}

type ReleaseOrderRow = {
  id: string
  buyer_id: string
  creator_id: string
  package_title: string
  package_price: number
  payment_status: EscrowPaymentStatus
  status: string
  transfer_group: string | null
  stripe_charge_id: string | null
  stripe_payment_intent_id: string | null
  stripe_transfer_id: string | null
  creator_profile_data: unknown | null
}

function getConnectionString() {
  return process.env.DIRECT_URL || process.env.DATABASE_URL
}

export function getPaymentsDbClient() {
  const connectionString = getConnectionString()
  if (!connectionString) {
    throw new Error("Missing DIRECT_URL or DATABASE_URL.")
  }
  return new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
}

export function resolveAppUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configured) {
    return configured.replace(/\/+$/, "")
  }

  const url = new URL(request.url)
  return `${url.protocol}//${url.host}`
}

export function toStripeAmount(amount: number) {
  return Math.max(0, Math.round(Number(amount ?? 0) * 100))
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export function readCreatorStripeAccountId(profileData: unknown) {
  const root = profileData && typeof profileData === "object" ? (profileData as Record<string, unknown>) : null
  const creator =
    root && root.creator && typeof root.creator === "object"
      ? (root.creator as Record<string, unknown>)
      : null

  return (
    normalizeText(creator?.stripeConnectAccountId) ||
    normalizeText(root?.stripeConnectAccountId) ||
    normalizeText(creator?.stripeAccountId) ||
    normalizeText(root?.stripeAccountId)
  )
}

export function buildTransferGroup(orderId: string) {
  return `order_${orderId}`
}

async function notifyCreatorOrderFunded(
  client: pg.Client,
  input: {
    orderId: string
    creatorId: string
    packageTitle: string
  }
) {
  const orderLabel = normalizeText(input.packageTitle) || `order #${input.orderId.slice(0, 8)}`

  await insertInboxNotification(client, {
    userId: input.creatorId,
    category: "payment",
    title: "Order funded",
    body: `The buyer paid for ${orderLabel}. You can start work now.`,
    actionUrl: "/dashboard/creator/orders",
  })
}

export async function createStripeCheckoutSessionForOrder(input: {
  order: OrderCheckoutRow
  buyerEmail?: string | null
  request: Request
}) {
  const stripe = getStripeClient()
  const transferGroup = normalizeText(input.order.transfer_group) || buildTransferGroup(input.order.id)
  const baseUrl = resolveAppUrl(input.request)

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: input.order.id,
    customer_email: normalizeText(input.buyerEmail) || undefined,
    success_url: `${baseUrl}/orders?checkout=success&order=${encodeURIComponent(input.order.id)}`,
    cancel_url: `${baseUrl}/orders?checkout=cancelled&order=${encodeURIComponent(input.order.id)}`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: toStripeAmount(input.order.package_price),
          product_data: {
            name: input.order.package_title,
            description: `Escrow funding for order ${input.order.id.slice(0, 8)}`,
          },
        },
      },
    ],
    metadata: {
      orderId: input.order.id,
      buyerId: input.order.buyer_id,
      creatorId: input.order.creator_id,
      transferGroup,
    },
    payment_intent_data: {
      metadata: {
        orderId: input.order.id,
        buyerId: input.order.buyer_id,
        creatorId: input.order.creator_id,
      },
      transfer_group: transferGroup,
    },
  })

  return { session, transferGroup }
}

export async function syncOrderEscrowAfterCheckoutReturn(input: { orderId: string }) {
  const stripe = getStripeClient()
  const client = getPaymentsDbClient()

  try {
    await client.connect()
    await client.query("begin")

    const orderResult = await client.query(
      `select
         id,
         buyer_id,
         creator_id,
         package_title,
         package_price,
         status,
         payment_status,
         stripe_checkout_session_id,
         transfer_group
       from public.orders
       where id = $1
       for update`,
      [input.orderId]
    )
    const order = orderResult.rows[0] as
      | {
          id: string
          buyer_id: string
          creator_id: string
          package_title: string
          package_price: number
          status: string
          payment_status: EscrowPaymentStatus
          stripe_checkout_session_id: string
          transfer_group: string
        }
      | undefined

    if (!order) {
      await client.query("rollback")
      return { updated: false }
    }

    if (order.payment_status === "pending" || order.payment_status === "paid") {
      await client.query("commit")
      return { updated: false }
    }

    const checkoutSessionId = normalizeText(order.stripe_checkout_session_id)
    if (!checkoutSessionId) {
      await client.query("commit")
      return { updated: false }
    }

    const session = await stripe.checkout.sessions.retrieve(checkoutSessionId)
    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : normalizeText(session.payment_intent?.id)

    const transferGroup =
      normalizeText(session.metadata?.transferGroup) ||
      normalizeText(order.transfer_group) ||
      buildTransferGroup(order.id)

    if (session.payment_status !== "paid") {
      await client.query("commit")
      return { updated: false }
    }

    let chargeId = ""
    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      chargeId =
        typeof paymentIntent.latest_charge === "string"
          ? paymentIntent.latest_charge
          : normalizeText(paymentIntent.latest_charge?.id)
    }

    await client.query(
      `update public.orders
       set
         payment_status = 'pending',
         status = case when status = 'pending_payment' then 'funded' else status end,
         stripe_payment_intent_id = $2,
         stripe_charge_id = $3,
         transfer_group = $4,
         escrow_funded_at = coalesce(escrow_funded_at, now()),
         updated_at = now()
       where id = $1`,
      [order.id, paymentIntentId, chargeId, transferGroup]
    )

    const updateTxResult = await client.query(
      `update public.payment_transactions
       set
         provider = 'stripe',
         provider_reference = $2,
         status = 'succeeded',
         payment_intent_id = $3,
         charge_id = $4,
         transfer_group = $5,
         notes = 'Buyer funded escrow through Stripe Checkout.'
       where checkout_session_id = $1 and transaction_type = 'charge'
       returning id`,
      [checkoutSessionId, paymentIntentId || checkoutSessionId, paymentIntentId, chargeId, transferGroup]
    )

    if (!updateTxResult.rows[0]) {
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
         values
           ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          "charge",
          order.id,
          order.buyer_id,
          order.creator_id,
          order.package_price,
          "USD",
          "card",
          "stripe",
          paymentIntentId || checkoutSessionId,
          "succeeded",
          checkoutSessionId,
          paymentIntentId,
          chargeId,
          transferGroup,
          "Buyer funded escrow through Stripe Checkout.",
        ]
      )
    }

    await notifyCreatorOrderFunded(client, {
      orderId: order.id,
      creatorId: order.creator_id,
      packageTitle: order.package_title,
    })

    await client.query("commit")
    return { updated: true }
  } catch (error) {
    await client.query("rollback").catch(() => {})
    throw error
  } finally {
    await client.end().catch(() => {})
  }
}

export async function releaseCreatorOrderEscrow(input: {
  orderId: string
  creatorId?: string
  finalOrderStatus?: "approved" | "completed" | "delivered"
}) {
  const stripe = getStripeClient()
  const client = getPaymentsDbClient()

  try {
    await client.connect()
    const params = [input.orderId]
    const creatorConstraint = input.creatorId ? " and o.creator_id = $2" : ""
    if (input.creatorId) {
      params.push(input.creatorId)
    }

    const orderResult = await client.query(
      `select
         o.id,
         o.buyer_id,
         o.creator_id,
         o.package_title,
         o.package_price,
         o.payment_status,
         o.status,
         o.transfer_group,
         o.stripe_charge_id,
         o.stripe_payment_intent_id,
         o.stripe_transfer_id,
         p.profile_data as creator_profile_data
       from public.orders o
       left join public.profiles p on p.id = o.creator_id
       where o.id = $1${creatorConstraint}
       limit 1`,
      params
    )

    const order = orderResult.rows[0] as ReleaseOrderRow | undefined
    if (!order) {
      throw new Error("Order not found.")
    }

    if (order.payment_status === "paid" && normalizeText(order.stripe_transfer_id)) {
      return {
        id: order.id,
        paymentStatus: "paid" as EscrowPaymentStatus,
        status: normalizeText(order.status) || input.finalOrderStatus || "completed",
        transferId: order.stripe_transfer_id,
      }
    }

    if (order.payment_status !== "pending") {
      throw new Error("Escrow funds are not ready for release yet.")
    }

    const isDev = process.env.NODE_ENV === "development"
    const destinationAccount = readCreatorStripeAccountId(order.creator_profile_data)
    if (!destinationAccount && !isDev) {
      throw new Error("Creator Stripe payout account is missing.")
    }

    const chargeId = normalizeText(order.stripe_charge_id)
    if (!chargeId && !isDev) {
      throw new Error("Stripe charge is missing for this order.")
    }

    // Calculate platform fee (dynamic from env)
    const platformFeePercent = Number(process.env.PLATFORM_FEE_PERCENT) || 10
    const totalAmount = order.package_price
    const feeAmount = totalAmount * (platformFeePercent / 100)
    const creatorAmount = totalAmount - feeAmount

    let transferId = `dev_transfer_${Math.random().toString(36).substring(7)}`

    if (destinationAccount && chargeId) {
      const transfer = await stripe.transfers.create({
        amount: toStripeAmount(creatorAmount),
        currency: "usd",
        destination: destinationAccount,
        source_transaction: chargeId,
        transfer_group: normalizeText(order.transfer_group) || buildTransferGroup(order.id),
        metadata: {
          orderId: order.id,
          creatorId: order.creator_id,
          buyerId: order.buyer_id,
          platformFee: feeAmount.toString(),
          feePercentage: `${platformFeePercent}%`,
        },
      })
      transferId = transfer.id
    }

    const finalOrderStatus = input.finalOrderStatus ?? "completed"

    await client.query("begin")
    await client.query(
      `update public.orders
       set
         status = $3,
         payment_status = 'paid',
         stripe_transfer_id = $2,
         payout_released_at = now(),
         updated_at = now()
       where id = $1`,
      [order.id, transferId, finalOrderStatus]
    )

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
           transfer_id,
           transfer_group,
           notes
         )
       values
         ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [
        "release",
        order.id,
        order.buyer_id,
        order.creator_id,
        creatorAmount, // Recording actual amount creator received
        "USD",
        "stripe_connect",
        "stripe",
        transferId,
        "succeeded",
        "",
        normalizeText(order.stripe_payment_intent_id),
        chargeId,
        transferId,
        normalizeText(order.transfer_group) || buildTransferGroup(order.id),
        `Escrow released to creator. (Platform cut: ${platformFeePercent}% / $${feeAmount.toFixed(2)})`,
      ]
    )
    await client.query("commit")

    return {
      id: order.id,
      paymentStatus: "paid" as EscrowPaymentStatus,
      status: finalOrderStatus,
      transferId: transferId,
    }
  } catch (error) {
    await client.query("rollback").catch(() => {})
    throw error
  } finally {
    await client.end().catch(() => {})
  }
}
