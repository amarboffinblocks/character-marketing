import { NextResponse } from "next/server"
import pg from "pg"

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
    return NextResponse.json({ error: "Server misconfigured." }, { status: 500 })
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
