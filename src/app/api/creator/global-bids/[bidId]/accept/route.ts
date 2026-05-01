import { NextResponse } from "next/server"
import pg from "pg"

import { createServerSupabaseClient } from "@/lib/supabase/server"

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function getDbClient() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (!connectionString) throw new Error("Missing DIRECT_URL or DATABASE_URL")
  return new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
}

export async function POST(_: Request, context: { params: Promise<{ bidId: string }> }) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { bidId } = await context.params
  const normalizedBidId = asString(bidId)
  if (!normalizedBidId) return NextResponse.json({ error: "bidId is required." }, { status: 400 })

  const client = getDbClient()
  try {
    await client.connect()

    const bidResult = await client.query(
      `select id
       from public.bid_posts
       where id = $1
         and regexp_replace(lower(trim(status)), '[^a-z0-9]+', '_', 'g') in ('global_bid', 'pending')
         and requester_id <> $2`,
      [normalizedBidId, user.id]
    )
    if (!bidResult.rows[0]) {
      return NextResponse.json({ error: "Bid not found." }, { status: 404 })
    }

    await client.query(
      `insert into public.bid_interests (bid_id, creator_id, status)
       values ($1, $2, 'interested')
       on conflict (bid_id, creator_id)
       do update set status = 'interested'`,
      [normalizedBidId, user.id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to accept bid."
    return NextResponse.json({ error: message }, { status: 400 })
  } finally {
    await client.end().catch(() => {})
  }
}
