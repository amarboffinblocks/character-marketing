import { NextResponse } from "next/server"
import type { PostgrestError } from "@supabase/supabase-js"

import { createServerSupabaseClient } from "@/lib/supabase/server"

type CreateCharacterPayload = {
  characterName?: string
  avatarUrl?: string
  backgroundUrl?: string
  visibility?: "private" | "public" | "unlisted"
  safety?: "SFW" | "NSFW"
  tags?: string[]
  description?: string
  scenario?: string
  personalitySummary?: string
  firstMessage?: string
  alternativeMessages?: string
  exampleDialogue?: string
  authorNotes?: string
  characterNotes?: string
  status?: "draft" | "published"
}

const allowedVisibility = new Set(["private", "public", "unlisted"])
const allowedSafety = new Set(["SFW", "NSFW"])
const allowedStatus = new Set(["draft", "published"])

function sanitizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function isMissingColumnError(error: PostgrestError): boolean {
  if (error.code === "PGRST204") return true
  return /column/i.test(error.message) && /not found|does not exist|schema cache/i.test(error.message)
}

function isMissingTableError(error: PostgrestError): boolean {
  if (error.code === "PGRST205") return true
  return /could not find the table|relation .* does not exist|schema cache/i.test(error.message.toLowerCase())
}

function extractMissingColumn(error: PostgrestError): string | null {
  const messageMatch = error.message.match(/'([a-z_]+)'/)
  if (messageMatch?.[1]) return messageMatch[1]
  const detailsMatch = error.details?.match(/'([a-z_]+)'/)
  return detailsMatch?.[1] ?? null
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as CreateCharacterPayload
  const characterName = sanitizeText(body.characterName)

  if (!characterName) {
    return NextResponse.json({ error: "Character name is required." }, { status: 400 })
  }

  const visibility = allowedVisibility.has(body.visibility ?? "") ? body.visibility : "private"
  const safety = allowedSafety.has(body.safety ?? "") ? body.safety : "SFW"
  const status = allowedStatus.has(body.status ?? "") ? body.status : "draft"
  const tags =
    Array.isArray(body.tags) && body.tags.length > 0
      ? body.tags.filter((value): value is string => typeof value === "string").map((value) => value.trim())
      : []

  const insertPayload: Record<string, unknown> = {
    // `creator_id` should always represent the original author, while `owner_id`
    // may change in transfer flows later.
    creator_id: user.id,
    owner_id: user.id,
    character_name: characterName,
    avatar_url: sanitizeText(body.avatarUrl) || null,
    background_url: sanitizeText(body.backgroundUrl) || null,
    visibility,
    safety,
    tags,
    description: sanitizeText(body.description),
    scenario: sanitizeText(body.scenario),
    personality_summary: sanitizeText(body.personalitySummary),
    first_message: sanitizeText(body.firstMessage),
    alternative_messages: sanitizeText(body.alternativeMessages),
    example_dialogue: sanitizeText(body.exampleDialogue),
    author_notes: sanitizeText(body.authorNotes),
    character_notes: sanitizeText(body.characterNotes),
    status,
  }

  let data: { id: string } | null = null
  let error: PostgrestError | null = null

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const result = await supabase.from("characters").insert(insertPayload).select("id").single()
    data = result.data
    error = result.error

    if (!error) break
    if (!isMissingColumnError(error)) break

    const missingColumn = extractMissingColumn(error)
    if (!missingColumn || !(missingColumn in insertPayload)) break
    delete insertPayload[missingColumn]
  }

  if (error) {
    return NextResponse.json(
      {
        error: "Unable to create character.",
        details: error.message,
        hint: isMissingTableError(error)
          ? "Run the characters table migration in Supabase first."
          : "Check characters table columns and RLS insert policy for authenticated users.",
      },
      { status: 400 }
    )
  }

  if (!data) {
    return NextResponse.json({ error: "Unable to create character." }, { status: 400 })
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const requestUrl = new URL(request.url)
  const editId = requestUrl.searchParams.get("id")?.trim()

  const query = supabase.from("characters").select("*").eq("creator_id", user.id)
  const { data, error } = editId ? await query.eq("id", editId) : await query

  if (error) {
    return NextResponse.json(
      {
        error: "Unable to load characters.",
        details: error.message,
        hint: isMissingTableError(error)
          ? "Run the characters table migration in Supabase first."
          : "Check characters table schema and RLS policies.",
      },
      { status: 400 }
    )
  }

  const items = (data ?? []).map((row) => {
    const record = row as Record<string, unknown>
    return {
      id: asString(record.id),
      characterName: asString(record.character_name),
      handle: "@you",
      avatarUrl: asString(record.avatar_url),
      backgroundUrl: asString(record.background_url),
      visibility: asString(record.visibility) || "private",
      safety: asString(record.safety) || "SFW",
      tags: asStringArray(record.tags),
      description: asString(record.description),
      scenario: asString(record.scenario),
      personalitySummary: asString(record.personality_summary),
      firstMessage: asString(record.first_message),
      alternativeMessages: asString(record.alternative_messages),
      exampleDialogue: asString(record.example_dialogue),
      authorNotes: asString(record.author_notes),
      characterNotes: asString(record.character_notes),
      status: asString(record.status) || "draft",
      updatedAt: "now",
      usageCount: 0,
    }
  })

  if (editId) {
    return NextResponse.json({ item: items[0] ?? null })
  }

  return NextResponse.json({ items })
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const id = url.searchParams.get("id")?.trim()
  if (!id) {
    return NextResponse.json({ error: "Character id is required." }, { status: 400 })
  }

  const { error } = await supabase
    .from("characters")
    .delete()
    .eq("id", id)
    .eq("creator_id", user.id)

  if (error) {
    return NextResponse.json(
      {
        error: "Unable to delete character.",
        details: error.message,
      },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const id = url.searchParams.get("id")?.trim()
  if (!id) {
    return NextResponse.json({ error: "Character id is required." }, { status: 400 })
  }

  const body = (await request.json()) as CreateCharacterPayload
  const characterName = sanitizeText(body.characterName)
  if (!characterName) {
    return NextResponse.json({ error: "Character name is required." }, { status: 400 })
  }

  const visibility = allowedVisibility.has(body.visibility ?? "") ? body.visibility : "private"
  const safety = allowedSafety.has(body.safety ?? "") ? body.safety : "SFW"
  const status = allowedStatus.has(body.status ?? "") ? body.status : "draft"
  const tags =
    Array.isArray(body.tags) && body.tags.length > 0
      ? body.tags.filter((value): value is string => typeof value === "string").map((value) => value.trim())
      : []

  const updatePayload: Record<string, unknown> = {
    character_name: characterName,
    avatar_url: sanitizeText(body.avatarUrl) || null,
    background_url: sanitizeText(body.backgroundUrl) || null,
    visibility,
    safety,
    tags,
    description: sanitizeText(body.description),
    scenario: sanitizeText(body.scenario),
    personality_summary: sanitizeText(body.personalitySummary),
    first_message: sanitizeText(body.firstMessage),
    alternative_messages: sanitizeText(body.alternativeMessages),
    example_dialogue: sanitizeText(body.exampleDialogue),
    author_notes: sanitizeText(body.authorNotes),
    character_notes: sanitizeText(body.characterNotes),
    status,
  }

  const { data, error } = await supabase
    .from("characters")
    .update(updatePayload)
    .eq("id", id)
    .eq("creator_id", user.id)
    .select("id")
    .single()

  if (error) {
    return NextResponse.json(
      {
        error: "Unable to update character.",
        details: error.message,
      },
      { status: 400 }
    )
  }

  if (!data) {
    return NextResponse.json({ error: "Unable to update character." }, { status: 400 })
  }

  return NextResponse.json({ id: data.id, success: true })
}
