import { NextResponse } from "next/server"

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function POST(_: Request, context: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await context.params
  const normalizedOrderId = asString(requestId)
  if (!normalizedOrderId) {
    return NextResponse.json({ error: "Order id is required." }, { status: 400 })
  }

  return NextResponse.json(
    { error: `Creator payout release is admin-only for order ${normalizedOrderId}.` },
    { status: 403 }
  )
}
