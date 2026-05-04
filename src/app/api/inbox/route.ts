import { NextResponse } from "next/server"
import pg from "pg"
import { createServerSupabaseClient } from "@/lib/supabase/server"

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
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
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })

  try {
    await client.connect()
    const result = await client.query(
      `select id, type, category, title, body, is_read as "isRead", action_url as "actionUrl", created_at as "createdAt"
       from public.inbox_notifications
       where user_id = $1
       order by created_at desc
       limit 50`,
      [user.id]
    )

    return NextResponse.json({ items: result.rows })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load inbox items."
    return NextResponse.json({ error: message }, { status: 400 })
  } finally {
    await client.end().catch(() => {})
  }
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payload = (await request.json().catch(() => ({}))) as { notificationId?: unknown; all?: boolean }
  const notificationId = asString(payload.notificationId)
  const all = payload.all === true

  if (!notificationId && !all) {
    return NextResponse.json({ error: "notificationId or all is required." }, { status: 400 })
  }

  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })

  try {
    await client.connect()
    if (all) {
      await client.query(
        `update public.inbox_notifications
         set is_read = true
         where user_id = $1`,
        [user.id]
      )
    } else {
      await client.query(
        `update public.inbox_notifications
         set is_read = true
         where id = $1 and user_id = $2`,
        [notificationId, user.id]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update notification."
    return NextResponse.json({ error: message }, { status: 400 })
  } finally {
    await client.end().catch(() => {})
  }
}
