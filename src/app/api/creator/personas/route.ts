import { NextResponse } from "next/server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

type PersonaPayload = {
  personaName?: string
  personaDetails?: string
  avatarUrl?: string
  tags?: string[]
  safety?: "SFW" | "NSFW"
  visibility?: "private" | "public" | "unlisted"
}

const allowedVisibility = new Set(["private", "public", "unlisted"])
const allowedSafety = new Set(["SFW", "NSFW"])

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function validatePersonaPayload(body: PersonaPayload): string | null {
  const personaName = asText(body.personaName)
  const personaDetails = asText(body.personaDetails)
  const avatarUrl = asText(body.avatarUrl)
  const tags = Array.isArray(body.tags) ? body.tags.filter((v): v is string => typeof v === "string") : []

  if (!personaName) return "Persona name is required."
  if (!personaDetails) return "Persona details are required."
  if (!avatarUrl) return "Avatar is required."
  if (tags.length === 0) return "At least one tag is required."
  return null
}

function mapPersonaRow(record: Record<string, unknown>) {
  return {
    id: asText(record.id),
    personaName: asText(record.persona_name),
    personaDetails: asText(record.persona_details),
    avatarUrl: asText(record.avatar_url),
    tags: Array.isArray(record.tags) ? record.tags.filter((v): v is string => typeof v === "string") : [],
    safety: asText(record.safety) || "SFW",
    visibility: asText(record.visibility) || "private",
    usageCount: Number(record.usage_count ?? 0) || 0,
    updatedAt: "now",
  }
}

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const requestUrl = new URL(request.url)
  const id = requestUrl.searchParams.get("id")?.trim()

  const query = supabase.from("personas").select("*").eq("creator_id", user.id)
  const { data, error } = id ? await query.eq("id", id) : await query
  if (error) {
    return NextResponse.json({ error: "Unable to load personas.", details: error.message }, { status: 400 })
  }

  const items = (data ?? []).map((row) => mapPersonaRow(row as Record<string, unknown>))
  if (id) return NextResponse.json({ item: items[0] ?? null })
  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = (await request.json()) as PersonaPayload
  const validationError = validatePersonaPayload(body)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

  const personaName = asText(body.personaName)
  const personaDetails = asText(body.personaDetails)
  const visibility = allowedVisibility.has(body.visibility ?? "") ? body.visibility : "private"
  const safety = allowedSafety.has(body.safety ?? "") ? body.safety : "SFW"

  const { data, error } = await supabase
    .from("personas")
    .insert({
      creator_id: user.id,
      persona_name: personaName,
      persona_details: personaDetails,
      avatar_url: asText(body.avatarUrl) || null,
      tags: Array.isArray(body.tags) ? body.tags.filter((v): v is string => typeof v === "string") : [],
      safety,
      visibility,
    })
    .select("id")
    .single()

  if (error) {
    return NextResponse.json({ error: "Unable to create persona.", details: error.message }, { status: 400 })
  }
  if (!data) {
    return NextResponse.json({ error: "Unable to create persona." }, { status: 400 })
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
  if (!id) return NextResponse.json({ error: "Persona id is required." }, { status: 400 })

  const body = (await request.json()) as PersonaPayload
  const validationError = validatePersonaPayload(body)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

  const personaName = asText(body.personaName)
  const personaDetails = asText(body.personaDetails)
  const visibility = allowedVisibility.has(body.visibility ?? "") ? body.visibility : "private"
  const safety = allowedSafety.has(body.safety ?? "") ? body.safety : "SFW"

  const { data, error } = await supabase
    .from("personas")
    .update({
      persona_name: personaName,
      persona_details: personaDetails,
      avatar_url: asText(body.avatarUrl) || null,
      tags: Array.isArray(body.tags) ? body.tags.filter((v): v is string => typeof v === "string") : [],
      safety,
      visibility,
    })
    .eq("id", id)
    .eq("creator_id", user.id)
    .select("id")
    .single()

  if (error) {
    return NextResponse.json({ error: "Unable to update persona.", details: error.message }, { status: 400 })
  }
  if (!data) {
    return NextResponse.json({ error: "Unable to update persona." }, { status: 400 })
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
  if (!id) return NextResponse.json({ error: "Persona id is required." }, { status: 400 })

  const { error } = await supabase.from("personas").delete().eq("id", id).eq("creator_id", user.id)
  if (error) {
    return NextResponse.json({ error: "Unable to delete persona.", details: error.message }, { status: 400 })
  }
  return NextResponse.json({ success: true })
}
