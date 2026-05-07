import { NextResponse } from "next/server"
import pg from "pg"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (!connectionString) {
    return NextResponse.json({ error: "Missing DIRECT_URL or DATABASE_URL" }, { status: 500 })
  }

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })

  try {
    await client.connect()
    const result = await client.query(
      `select
        o.id,
        o.request_id,
        o.creator_id,
        o.buyer_id,
        o.package_id,
        o.package_title,
        o.package_price,
        o.tokens_label,
        o.status,
        o.payment_status,
        o.created_at,
        o.request_snapshot,
        p.profile_data as creator_profile_data
      from public.orders o
      left join public.profiles p on p.id = o.creator_id
      where o.buyer_id = $1
      order by o.created_at desc`,
      [user.id]
    )

    return NextResponse.json({ orders: result.rows ?? [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load orders."
    return NextResponse.json({ error: message }, { status: 400 })
  } finally {
    await client.end().catch(() => {})
  }
}
