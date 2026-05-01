import { NextResponse } from "next/server"
import pg from "pg"
import { z } from "zod"

import { mapBidRowsToItems, type BidPostRow } from "@/app/api/site/bids/shared"
import { createServerSupabaseClient } from "@/lib/supabase/server"

type InterestRow = {
  bid_id: string
  creator_id: string
  status: "interested" | "assigned" | "withdrawn"
}

type ProfileRow = {
  id: string
  profile_data: Record<string, unknown> | null
}

const bidInputSchema = z.object({
  title: z.string().trim().min(1),
  duration: z.string().trim().min(1),
  budget: z.string().trim().min(1),
  tokenCount: z.string().trim().min(1),
  character: z.number().int().nonnegative(),
  persona: z.number().int().nonnegative(),
  lorebook: z.number().int().nonnegative(),
  background: z.number().int().nonnegative(),
  avatar: z.number().int().nonnegative(),
  skillsNeeded: z.string().trim().min(1),
  description: z.string().trim().min(1),
  isPriceNegotiable: z.boolean(),
  visibility: z.enum(["open", "closed"]).default("open"),
  status: z.enum(["global_bid", "pending", "processing", "completed", "rejected"]).default("global_bid"),
})

function getDbClient() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (!connectionString) throw new Error("Missing DIRECT_URL or DATABASE_URL")
  return new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
}

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const client = getDbClient()
  try {
    await client.connect()
    const bidsResult = await client.query(
      `select id, requester_id, title, duration, budget, token_count,
              character_count, persona_count, lorebook_count, background_count, avatar_count,
              skills_needed, description, is_price_negotiable, status, assigned_creator_id,
              created_at, updated_at
       from public.bid_posts
       where requester_id = $1
       order by created_at desc`,
      [user.id]
    )
    const bids = (bidsResult.rows ?? []) as BidPostRow[]
    const bidIds = bids.map((row) => row.id)
    if (bidIds.length === 0) return NextResponse.json({ bids: [] })

    const interestsResult = await client.query(
      `select bid_id, creator_id, status
       from public.bid_interests
       where bid_id = any($1::uuid[])`,
      [bidIds]
    )
    const interests = (interestsResult.rows ?? []) as InterestRow[]

    const profileIds = Array.from(
      new Set(
        [
          ...interests.map((item) => item.creator_id),
          ...bids.map((item) => item.assigned_creator_id).filter(Boolean),
        ].filter(Boolean)
      )
    )
    let profiles: ProfileRow[] = []
    if (profileIds.length > 0) {
      const profilesResult = await client.query(
        `select id, profile_data
         from public.profiles
         where id = any($1::uuid[])`,
        [profileIds]
      )
      profiles = (profilesResult.rows ?? []) as ProfileRow[]
    }

    return NextResponse.json({
      bids: mapBidRowsToItems({ bids, interests, profiles }),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load bids."
    return NextResponse.json({ error: message }, { status: 400 })
  } finally {
    await client.end().catch(() => {})
  }
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const parsed = bidInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 })
  }

  const payload = parsed.data
  const nextStatus = payload.visibility === "closed" ? "pending" : "global_bid"
  const client = getDbClient()
  try {
    await client.connect()
    const result = await client.query(
      `insert into public.bid_posts
       (requester_id, title, duration, budget, token_count, character_count, persona_count, lorebook_count, background_count, avatar_count,
        skills_needed, description, is_price_negotiable, status)
       values
       ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       returning id`,
      [
        user.id,
        payload.title,
        payload.duration,
        payload.budget,
        payload.tokenCount,
        payload.character,
        payload.persona,
        payload.lorebook,
        payload.background,
        payload.avatar,
        payload.skillsNeeded,
        payload.description,
        payload.isPriceNegotiable,
        nextStatus,
      ]
    )
    return NextResponse.json({ id: result.rows[0]?.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create bid."
    return NextResponse.json({ error: message }, { status: 400 })
  } finally {
    await client.end().catch(() => {})
  }
}
