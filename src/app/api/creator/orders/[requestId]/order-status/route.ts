import { NextResponse } from "next/server"
import { z } from "zod"

import { updateCreatorOrderStatus } from "@/features/creator/orders/creator-orders"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const payloadSchema = z.object({
  status: z.enum(["pending", "processing", "on_hold", "completed"]),
})

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function PATCH(request: Request, context: { params: Promise<{ requestId: string }> }) {
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

  const body = await request.json()
  const parsed = payloadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 })
  }

  try {
    const updated = await updateCreatorOrderStatus({
      orderId: normalizedOrderId,
      creatorId: user.id,
      status: parsed.data.status,
    })

    return NextResponse.json({ order: updated })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update order."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
