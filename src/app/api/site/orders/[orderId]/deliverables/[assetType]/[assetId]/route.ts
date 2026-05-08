import { NextResponse } from "next/server"

import { fetchOrderDeliverableItemForViewer } from "@/lib/order-deliveries"
import { createServerSupabaseClient } from "@/lib/supabase/server"

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function GET(
  _: Request,
  context: { params: Promise<{ orderId: string; assetType: string; assetId: string }> }
) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const { orderId, assetType, assetId } = await context.params

  try {
    const item = await fetchOrderDeliverableItemForViewer({
      orderId: asString(orderId),
      viewerId: user.id,
      assetType: asString(assetType),
      assetId: asString(assetId),
    })
    return NextResponse.json({ item })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load delivered asset."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
