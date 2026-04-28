import { NextResponse } from "next/server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

type ServicePayload = {
  id?: string
  serviceName?: string
  description?: string
  price?: number
  discountedPrice?: number | null
  tokensLabel?: string
  personaCount?: number
  lorebookCount?: number
  backgroundCount?: number
  avatarCount?: number
  characterCount?: number
  highlights?: string[]
  isRecommended?: boolean
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function asBoolean(value: unknown): boolean {
  return value === true
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizePayload(payload: ServicePayload) {
  const price = asNumber(payload.price, 0)
  const discountedPriceRaw =
    payload.discountedPrice === null || payload.discountedPrice === undefined
      ? null
      : asNumber(payload.discountedPrice, 0)

  return {
    service_name: asString(payload.serviceName),
    description: asString(payload.description),
    price,
    discounted_price:
      discountedPriceRaw && discountedPriceRaw > 0 && discountedPriceRaw < price ? discountedPriceRaw : null,
    tokens_label: asString(payload.tokensLabel),
    persona_count: asNumber(payload.personaCount, 0),
    lorebook_count: asNumber(payload.lorebookCount, 0),
    background_count: asNumber(payload.backgroundCount, 0),
    avatar_count: asNumber(payload.avatarCount, 0),
    character_count: asNumber(payload.characterCount, 0),
    highlights: asStringArray(payload.highlights),
    is_recommended: asBoolean(payload.isRecommended),
  }
}

function mapRow(row: Record<string, unknown>) {
  return {
    id: asString(row.id),
    serviceName: asString(row.service_name),
    description: asString(row.description),
    price: asNumber(row.price, 0),
    discountedPrice: row.discounted_price === null ? null : asNumber(row.discounted_price, 0),
    tokensLabel: asString(row.tokens_label),
    personaCount: asNumber(row.persona_count, 0),
    lorebookCount: asNumber(row.lorebook_count, 0),
    backgroundCount: asNumber(row.background_count, 0),
    avatarCount: asNumber(row.avatar_count, 0),
    characterCount: asNumber(row.character_count, 0),
    highlights: asStringArray(row.highlights),
    isRecommended: asBoolean(row.is_recommended),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  }
}

function validate(payload: ReturnType<typeof normalizePayload>) {
  if (!payload.service_name) return "Service name is required."
  if (!payload.description) return "Description is required."
  if (payload.price <= 0) return "Price must be greater than 0."
  if (!payload.tokens_label) return "Tokens label is required."
  return null
}

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("creator_services")
    .select("*")
    .eq("creator_id", user.id)
    .order("updated_at", { ascending: false })

  if (error) return NextResponse.json({ error: "Unable to load services.", details: error.message }, { status: 400 })

  return NextResponse.json({ items: (data ?? []).map((row) => mapRow(row as Record<string, unknown>)) })
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = (await request.json()) as ServicePayload
  const payload = normalizePayload(body)
  const validation = validate(payload)
  if (validation) return NextResponse.json({ error: validation }, { status: 400 })

  const { data, error } = await supabase
    .from("creator_services")
    .insert({
      creator_id: user.id,
      ...payload,
    })
    .select("*")
    .single()

  if (error) return NextResponse.json({ error: "Unable to create service.", details: error.message }, { status: 400 })

  return NextResponse.json({ item: mapRow(data as Record<string, unknown>) }, { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = (await request.json()) as ServicePayload
  const id = asString(body.id)
  if (!id) return NextResponse.json({ error: "Service id is required." }, { status: 400 })

  const payload = normalizePayload(body)
  const validation = validate(payload)
  if (validation) return NextResponse.json({ error: validation }, { status: 400 })

  const { data, error } = await supabase
    .from("creator_services")
    .update(payload)
    .eq("id", id)
    .eq("creator_id", user.id)
    .select("*")
    .single()

  if (error) return NextResponse.json({ error: "Unable to update service.", details: error.message }, { status: 400 })

  return NextResponse.json({ item: mapRow(data as Record<string, unknown>) })
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(request.url)
  const id = asString(url.searchParams.get("id"))
  if (!id) return NextResponse.json({ error: "Service id is required." }, { status: 400 })

  const { error } = await supabase.from("creator_services").delete().eq("id", id).eq("creator_id", user.id)
  if (error) return NextResponse.json({ error: "Unable to delete service.", details: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
