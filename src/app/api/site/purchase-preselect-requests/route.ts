import { NextResponse } from "next/server"
import { z } from "zod"

import { createServerSupabaseClient } from "@/lib/supabase/server"

import pg from "pg"

const requestSchema = z.object({
  creatorId: z.string().uuid("Invalid creator id"),
  packageId: z.string().min(1, "Package id is required"),
  packageTitle: z.string().trim().min(1, "Package title is required"),
  packagePrice: z.number().int().positive("Package price must be greater than 0"),
  tokensLabel: z.string().trim().min(1, "Tokens label is required"),
  tokenCount: z.string().trim().min(1, "Token count is required"),
  requestedAssets: z.object({
    character: z.number().int().nonnegative(),
    persona: z.number().int().nonnegative(),
    lorebook: z.number().int().nonnegative(),
    background: z.number().int().nonnegative(),
    avatar: z.number().int().nonnegative(),
  }),
  messageToCreator: z.string().trim().default(""),
})

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request payload" },
      { status: 400 }
    )
  }

  const payload = parsed.data

  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (!connectionString) {
    return NextResponse.json({ error: "Server misconfigured." }, { status: 500 })
  }

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    await client.query(
      `insert into public.requests
        (request_type, creator_id, requester_id, package_id, package_title, package_price, tokens_label, request_payload, status)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        "preselect_package",
        payload.creatorId,
        user.id,
        payload.packageId,
        payload.packageTitle,
        payload.packagePrice,
        payload.tokensLabel,
        {
          tokenCount: payload.tokenCount,
          requestedAssets: payload.requestedAssets,
          messageToCreator: payload.messageToCreator,
        },
        "pending",
      ]
    )
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ error: "Unable to submit pre-select request.", details: message }, { status: 400 })
  } finally {
    await client.end().catch(() => {})
  }

  return NextResponse.json({ success: true })
}

