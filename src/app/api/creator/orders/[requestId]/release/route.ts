import { NextResponse } from "next/server"

import { releaseCreatorOrderEscrow } from "@/lib/payments/escrow"
import { createServerSupabaseClient } from "@/lib/supabase/server"

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function POST(_: Request, context: { params: Promise<{ requestId: string }> }) {
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

  try {
    const updated = await releaseCreatorOrderEscrow({
      orderId: normalizedOrderId,
      creatorId: user.id,
    })

    return NextResponse.json({ order: updated })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to release creator payout."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
