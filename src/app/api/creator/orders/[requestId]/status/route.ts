import { NextResponse } from "next/server"
import { z } from "zod"

import { updateCreatorRequestStatus } from "@/features/creator/orders/creator-requests"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const payloadSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
})

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function PATCH(request: Request, context: { params: Promise<{ requestId: string }> }) {
  try {
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

    const body = await request.json()
    const parsed = payloadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 })
    }

    const updated = await updateCreatorRequestStatus({
      requestId: normalizedRequestId,
      creatorId: user.id,
      status: parsed.data.status,
    })

    return NextResponse.json({ request: updated })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update order status."
    const status = message === "Request not found." ? 404 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
