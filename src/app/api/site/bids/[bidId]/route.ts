import { NextResponse } from "next/server"
import pg from "pg"
import { z } from "zod"

import { mapBidRowsToItems, type BidPostRow } from "@/app/api/site/bids/shared"
import { createServerSupabaseClient } from "@/lib/supabase/server"

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
const assignSchema = z.object({
  assignedCreatorId: z.string().uuid(),
})
const visibilitySchema = z.object({
  visibility: z.enum(["open", "closed"]),
})

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function getDbClient() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (!connectionString) throw new Error("Missing DIRECT_URL or DATABASE_URL")
  return new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
}

export async function GET(_: Request, context: { params: Promise<{ bidId: string }> }) {
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
    const result = await client.query(
      `select id, requester_id, title, duration, budget, token_count,
              character_count, persona_count, lorebook_count, background_count, avatar_count,
              skills_needed, description, is_price_negotiable, status, assigned_creator_id,
              created_at, updated_at
       from public.bid_posts
       where id = $1 and requester_id = $2`,
      [normalizedBidId, user.id]
    )
    const bid = result.rows[0] as BidPostRow | undefined
    if (!bid) return NextResponse.json({ error: "Bid not found." }, { status: 404 })
    const mapped = mapBidRowsToItems({ bids: [bid], interests: [], profiles: [] })[0]
    return NextResponse.json({ bid: mapped })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load bid."
    return NextResponse.json({ error: message }, { status: 400 })
  } finally {
    await client.end().catch(() => {})
  }
}

export async function PUT(request: Request, context: { params: Promise<{ bidId: string }> }) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { bidId } = await context.params
  const normalizedBidId = asString(bidId)
  if (!normalizedBidId) return NextResponse.json({ error: "bidId is required." }, { status: 400 })

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
      `update public.bid_posts
       set title = $1, duration = $2, budget = $3, token_count = $4,
           character_count = $5, persona_count = $6, lorebook_count = $7, background_count = $8, avatar_count = $9,
           skills_needed = $10, description = $11, is_price_negotiable = $12, status = $13, updated_at = now()
       where id = $14 and requester_id = $15
       returning id`,
      [
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
        normalizedBidId,
        user.id,
      ]
    )
    if (!result.rows[0]) return NextResponse.json({ error: "Bid not found." }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update bid."
    return NextResponse.json({ error: message }, { status: 400 })
  } finally {
    await client.end().catch(() => {})
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ bidId: string }> }) {
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
    const result = await client.query(
      `delete from public.bid_posts where id = $1 and requester_id = $2 returning id`,
      [normalizedBidId, user.id]
    )
    if (!result.rows[0]) return NextResponse.json({ error: "Bid not found." }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete bid."
    return NextResponse.json({ error: message }, { status: 400 })
  } finally {
    await client.end().catch(() => {})
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ bidId: string }> }) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { bidId } = await context.params
  const normalizedBidId = asString(bidId)
  if (!normalizedBidId) return NextResponse.json({ error: "bidId is required." }, { status: 400 })

  const body = await request.json()
  const parsedAssign = assignSchema.safeParse(body)
  const parsedVisibility = visibilitySchema.safeParse(body)
  if (!parsedAssign.success && !parsedVisibility.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 })
  }

  const client = getDbClient()
  try {
    await client.connect()
    if (parsedAssign.success) {
      const result = await client.query(
        `update public.bid_posts
         set assigned_creator_id = $1,
             status = 'processing',
             updated_at = now()
         where id = $2 and requester_id = $3
         returning id`,
        [parsedAssign.data.assignedCreatorId, normalizedBidId, user.id]
      )
      if (!result.rows[0]) return NextResponse.json({ error: "Bid not found." }, { status: 404 })

      await client.query(
        `update public.bid_interests
         set status = case when creator_id = $1 then 'assigned' else status end
         where bid_id = $2`,
        [parsedAssign.data.assignedCreatorId, normalizedBidId]
      )
    } else if (parsedVisibility.success) {
      const nextStatus = parsedVisibility.data.visibility === "closed" ? "pending" : "global_bid"
      const result = await client.query(
        `update public.bid_posts
         set status = $1, updated_at = now()
         where id = $2 and requester_id = $3
         returning id`,
        [nextStatus, normalizedBidId, user.id]
      )
      if (!result.rows[0]) return NextResponse.json({ error: "Bid not found." }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to assign creator."
    return NextResponse.json({ error: message }, { status: 400 })
  } finally {
    await client.end().catch(() => {})
  }
}
