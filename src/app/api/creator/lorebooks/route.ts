import { NextResponse } from "next/server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

type LorebookPayloadEntry = {
  id?: string
  keywords?: string
  context?: string
}

type LorebookPayload = {
  lorebookName?: string
  description?: string
  avatarUrl?: string
  tags?: string[]
  safety?: "SFW" | "NSFW"
  visibility?: "private" | "public" | "unlisted"
  entries?: LorebookPayloadEntry[]
}

const allowedVisibility = new Set(["private", "public", "unlisted"])
const allowedSafety = new Set(["SFW", "NSFW"])

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeEntries(input: unknown): Array<{ id: string; keywords: string; context: string }> {
  if (!Array.isArray(input)) return []
  return input
    .map((entry) => {
      const row = entry as LorebookPayloadEntry
      return {
        id: asText(row.id) || crypto.randomUUID(),
        keywords: asText(row.keywords),
        context: asText(row.context),
      }
    })
    .filter((entry) => entry.keywords.length > 0 || entry.context.length > 0)
}

function validateLorebookPayload(body: LorebookPayload): string | null {
  const lorebookName = asText(body.lorebookName)
  const description = asText(body.description)
  const avatarUrl = asText(body.avatarUrl)
  const tags = Array.isArray(body.tags) ? body.tags.filter((v): v is string => typeof v === "string") : []
  const entries = normalizeEntries(body.entries)

  if (!lorebookName) return "Lorebook name is required."
  if (!description) return "Description is required."
  if (!avatarUrl) return "Avatar is required."
  if (tags.length === 0) return "At least one tag is required."
  if (entries.length === 0) return "At least one entry is required."
  if (entries.some((entry) => entry.keywords.length === 0)) return "Each entry must include keywords."
  if (entries.some((entry) => entry.context.length === 0)) return "Each entry must include context."
  return null
}

function mapLorebookRow(record: Record<string, unknown>) {
  return {
    id: asText(record.id),
    lorebookName: asText(record.lorebook_name),
    description: asText(record.description),
    avatarUrl: asText(record.avatar_url),
    tags: Array.isArray(record.tags) ? record.tags.filter((v): v is string => typeof v === "string") : [],
    safety: asText(record.safety) || "SFW",
    visibility: asText(record.visibility) || "private",
    entries: normalizeEntries(record.entries),
    updatedAt: "now",
  }
}

function isMissingColumnError(message: string, columnName: string) {
  return (
    message.includes(`Could not find the '${columnName}' column`) ||
    message.includes(`column "${columnName}" does not exist`)
  )
}

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const requestUrl = new URL(request.url)
  const id = requestUrl.searchParams.get("id")?.trim()

  const query = supabase.from("lorebooks").select("*").eq("creator_id", user.id)
  const { data, error } = id ? await query.eq("id", id) : await query
  if (error) {
    return NextResponse.json({ error: "Unable to load lorebooks.", details: error.message }, { status: 400 })
  }

  const items = (data ?? []).map((row) => mapLorebookRow(row as Record<string, unknown>))
  if (id) return NextResponse.json({ item: items[0] ?? null })
  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = (await request.json()) as LorebookPayload
  const validationError = validateLorebookPayload(body)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })
  const lorebookName = asText(body.lorebookName)

  const visibility = allowedVisibility.has(body.visibility ?? "") ? body.visibility : "private"
  const safety = allowedSafety.has(body.safety ?? "") ? body.safety : "SFW"

  const insertPayload = {
    creator_id: user.id,
    lorebook_name: lorebookName,
    description: asText(body.description),
    avatar_url: asText(body.avatarUrl) || null,
    tags: Array.isArray(body.tags) ? body.tags.filter((v): v is string => typeof v === "string") : [],
    safety,
    visibility,
    entries: normalizeEntries(body.entries),
  }

  let { data, error } = await supabase.from("lorebooks").insert(insertPayload).select("id").single()

  if (error && isMissingColumnError(error.message, "description")) {
    const { description: _description, ...legacyInsertPayload } = insertPayload
    const fallbackResult = await supabase.from("lorebooks").insert(legacyInsertPayload).select("id").single()
    data = fallbackResult.data
    error = fallbackResult.error
  }

  if (error) {
    return NextResponse.json({ error: "Unable to create lorebook.", details: error.message }, { status: 400 })
  }
  return NextResponse.json({ id: data.id }, { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const requestUrl = new URL(request.url)
  const id = requestUrl.searchParams.get("id")?.trim()
  if (!id) return NextResponse.json({ error: "Lorebook id is required." }, { status: 400 })

  const body = (await request.json()) as LorebookPayload
  const validationError = validateLorebookPayload(body)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })
  const lorebookName = asText(body.lorebookName)

  const visibility = allowedVisibility.has(body.visibility ?? "") ? body.visibility : "private"
  const safety = allowedSafety.has(body.safety ?? "") ? body.safety : "SFW"

  const updatePayload = {
    lorebook_name: lorebookName,
    description: asText(body.description),
    avatar_url: asText(body.avatarUrl) || null,
    tags: Array.isArray(body.tags) ? body.tags.filter((v): v is string => typeof v === "string") : [],
    safety,
    visibility,
    entries: normalizeEntries(body.entries),
  }

  let { data, error } = await supabase
    .from("lorebooks")
    .update(updatePayload)
    .eq("id", id)
    .eq("creator_id", user.id)
    .select("id")
    .single()

  if (error && isMissingColumnError(error.message, "description")) {
    const { description: _description, ...legacyUpdatePayload } = updatePayload
    const fallbackResult = await supabase
      .from("lorebooks")
      .update(legacyUpdatePayload)
      .eq("id", id)
      .eq("creator_id", user.id)
      .select("id")
      .single()
    data = fallbackResult.data
    error = fallbackResult.error
  }

  if (error) {
    return NextResponse.json({ error: "Unable to update lorebook.", details: error.message }, { status: 400 })
  }
  return NextResponse.json({ id: data.id, success: true })
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(request.url)
  const id = url.searchParams.get("id")?.trim()
  if (!id) return NextResponse.json({ error: "Lorebook id is required." }, { status: 400 })

  const { error } = await supabase.from("lorebooks").delete().eq("id", id).eq("creator_id", user.id)
  if (error) {
    return NextResponse.json({ error: "Unable to delete lorebook.", details: error.message }, { status: 400 })
  }
  return NextResponse.json({ success: true })
}
