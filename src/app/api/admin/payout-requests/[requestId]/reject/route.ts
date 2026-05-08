import { NextResponse } from "next/server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { resolvePersistedRole } from "@/lib/profile-role"
import { getPaymentsDbClient } from "@/lib/payments/escrow"
import { insertInboxNotification } from "@/lib/inbox-notifications"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function POST(
  request: Request,
  context: { params: Promise<{ requestId: string }> }
) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const role = user ? await resolvePersistedRole(supabase, user) : null
  if (!user || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const { requestId } = await context.params
  const normalizedId = asString(requestId)
  if (!normalizedId) {
    return NextResponse.json({ error: "Request ID is required." }, { status: 400 })
  }

  let body: { reason?: string } = {}
  try {
    body = await request.json()
  } catch {
    // empty body ok
  }

  const payoutRequest = await prisma.payoutRequest.findUnique({
    where: { id: normalizedId },
  })

  if (!payoutRequest) {
    return NextResponse.json({ error: "Payout request not found." }, { status: 404 })
  }

  if (payoutRequest.status !== "pending") {
    return NextResponse.json(
      { error: `Cannot reject a request with status '${payoutRequest.status}'.` },
      { status: 400 }
    )
  }

  await prisma.payoutRequest.update({
    where: { id: normalizedId },
    data: {
      status: "rejected",
      approvedBy: user.id,
      rejectedReason: body.reason?.trim() ?? "Rejected by admin.",
    },
  })

  // Log admin action
  await prisma.adminLog.create({
    data: {
      adminId: user.id,
      action: "reject_payout",
      targetType: "payout_request",
      targetId: normalizedId,
      notes: body.reason?.trim() ?? "Rejected by admin.",
    },
  })

  // Notify creator
  const dbClient = getPaymentsDbClient()
  try {
    await dbClient.connect()
    await insertInboxNotification(dbClient, {
      userId: payoutRequest.creatorId,
      category: "payment",
      title: "Payout rejected",
      body: `Your payout request of $${(payoutRequest.amount / 100).toFixed(2)} was not approved. Reason: ${body.reason?.trim() || "No reason provided."}`,
      actionUrl: "/dashboard/creator/earnings",
    })
  } finally {
    await dbClient.end().catch(() => {})
  }

  return NextResponse.json({ status: "rejected" })
}
