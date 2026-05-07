import { NextResponse } from "next/server"
import pg from "pg"

import { createServerSupabaseClient } from "@/lib/supabase/server"

function isMissingOrdersTableError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "42P01"
  )
}

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

    try {
      const result = await client.query(
        `select
          r.id,
          r.request_type,
          r.creator_id,
          r.requester_id,
          r.package_id,
          r.package_title,
          r.package_price,
          r.tokens_label,
          r.status,
          r.created_at,
          r.request_payload,
          p.profile_data as creator_profile_data,
          o.id as order_id
        from public.requests r
        left join public.profiles p on p.id = r.creator_id
        left join public.orders o on o.request_id = r.id
        where r.requester_id = $1
        order by r.created_at desc`,
        [user.id]
      )

      return NextResponse.json({ requests: result.rows ?? [] })
    } catch (error) {
      if (isMissingOrdersTableError(error)) {
        const fallbackResult = await client.query(
          `select
            r.id,
            r.request_type,
            r.creator_id,
            r.requester_id,
            r.package_id,
            r.package_title,
            r.package_price,
            r.tokens_label,
            r.status,
            r.created_at,
            r.request_payload,
            p.profile_data as creator_profile_data,
            null::uuid as order_id
          from public.requests r
          left join public.profiles p on p.id = r.creator_id
          where r.requester_id = $1
          order by r.created_at desc`,
          [user.id]
        )

        return NextResponse.json({ requests: fallbackResult.rows ?? [] })
      }

      throw error
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load requests."
    return NextResponse.json({ error: message }, { status: 400 })
  } finally {
    await client.end().catch(() => {})
  }
}
