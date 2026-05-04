import { NextResponse } from "next/server"

import { fetchOrderDeliverablesForViewer } from "@/lib/order-deliveries"
import { createServerSupabaseClient } from "@/lib/supabase/server"

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export async function GET(_: Request, context: { params: Promise<{ requestId: string }> }) {
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
  if (!isUuid(normalizedOrderId)) {
    return NextResponse.json({
      deliveryNote: "",
      deliverables: [],
      viewerLabel:
        (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()) ||
        (typeof user.email === "string" && user.email.trim()) ||
        user.id.slice(0, 8),
      isBuyer: false,
      orderStatus: "",
      paymentStatus: "",
    })
  }

  try {
    const result = await fetchOrderDeliverablesForViewer({
      orderId: normalizedOrderId,
      viewerId: user.id,
    })

    return NextResponse.json({
      order: result.order,
      deliveryNote: result.deliveryNote,
      deliverables: result.deliverables,
      viewerLabel:
        (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()) ||
        (typeof user.email === "string" && user.email.trim()) ||
        user.id.slice(0, 8),
      isBuyer: result.order.buyer_id === user.id,
      orderStatus: result.order.status,
      paymentStatus: result.order.payment_status,
    })
  } catch (error) {
    return NextResponse.json({ error: "No preview yet." }, { status: 200 })
  }
}
