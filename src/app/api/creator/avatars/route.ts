import { NextResponse } from "next/server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

type AvatarPayload = {
  avatarName?: string
  imageUrl?: string
  tags?: string[]
  safety?: "SFW" | "NSFW"
  visibility?: "private" | "public" | "unlisted"
  style?: "anime" | "realistic" | "semi-real"
  notes?: string
}

const allowedVisibility = new Set(["private", "public", "unlisted"])
const allowedSafety = new Set(["SFW", "NSFW"])
const allowedStyle = new Set(["anime", "realistic", "semi-real"])

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function isMissingTableError(message: string, tableName: string) {
  return (
    message.includes(`Could not find the table 'public.${tableName}'`) ||
    message.includes(`relation "public.${tableName}" does not exist`)
  )
}

function validateAvatarPayload(body: AvatarPayload): string | null {
  const avatarName = asText(body.avatarName)
  const imageUrl = asText(body.imageUrl)
  const notes = asText(body.notes)
  const tags = Array.isArray(body.tags) ? body.tags.filter((v): v is string => typeof v === "string") : []

  if (!avatarName) return "Avatar name is required."
  if (!imageUrl) return "Avatar image is required."
  if (!notes) return "Notes are required."
  if (tags.length === 0) return "At least one tag is required."
  return null
}

function mapAvatarRow(record: Record<string, unknown>) {
  return {
    id: asText(record.id),
    avatarName: asText(record.avatar_name),
    imageUrl: asText(record.image_url),
    tags: Array.isArray(record.tags) ? record.tags.filter((v): v is string => typeof v === "string") : [],
    safety: asText(record.safety) || "SFW",
    visibility: asText(record.visibility) || "private",
    style: asText(record.style) || "semi-real",
    notes: asText(record.notes),
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

  const query = supabase.from("avatars").select("*").eq("creator_id", user.id)
  const { data, error } = id ? await query.eq("id", id) : await query
  if (error) {
    return NextResponse.json(
      {
        error: "Unable to load avatars.",
        details: error.message,
        hint: isMissingTableError(error.message, "avatars")
          ? "Run the avatars migration to create public.avatars."
          : undefined,
      },
      { status: 400 }
    )
  }

  const items = (data ?? []).map((row) => mapAvatarRow(row as Record<string, unknown>))
  if (id) return NextResponse.json({ item: items[0] ?? null })
  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = (await request.json()) as AvatarPayload
  const validationError = validateAvatarPayload(body)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

  const avatarName = asText(body.avatarName)
  const visibility = allowedVisibility.has(body.visibility ?? "") ? body.visibility : "private"
  const safety = allowedSafety.has(body.safety ?? "") ? body.safety : "SFW"
  const style = allowedStyle.has(body.style ?? "") ? body.style : "semi-real"

  const { data, error } = await supabase
    .from("avatars")
    .insert({
      creator_id: user.id,
      avatar_name: avatarName,
      image_url: asText(body.imageUrl) || null,
      tags: Array.isArray(body.tags) ? body.tags.filter((v): v is string => typeof v === "string") : [],
      safety,
      visibility,
      style,
      notes: asText(body.notes),
    })
    .select("id")
    .single()

  if (error) {
    return NextResponse.json(
      {
        error: "Unable to create avatar.",
        details: error.message,
        hint: isMissingTableError(error.message, "avatars")
          ? "Run the avatars migration to create public.avatars."
          : undefined,
      },
      { status: 400 }
    )
  }
  if (!data) {
    return NextResponse.json({ error: "Unable to create avatar." }, { status: 400 })
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
  if (!id) return NextResponse.json({ error: "Avatar id is required." }, { status: 400 })

  const body = (await request.json()) as AvatarPayload
  const validationError = validateAvatarPayload(body)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

  const avatarName = asText(body.avatarName)
  const visibility = allowedVisibility.has(body.visibility ?? "") ? body.visibility : "private"
  const safety = allowedSafety.has(body.safety ?? "") ? body.safety : "SFW"
  const style = allowedStyle.has(body.style ?? "") ? body.style : "semi-real"

  const { data, error } = await supabase
    .from("avatars")
    .update({
      avatar_name: avatarName,
      image_url: asText(body.imageUrl) || null,
      tags: Array.isArray(body.tags) ? body.tags.filter((v): v is string => typeof v === "string") : [],
      safety,
      visibility,
      style,
      notes: asText(body.notes),
    })
    .eq("id", id)
    .eq("creator_id", user.id)
    .select("id")
    .single()

  if (error) {
    return NextResponse.json(
      {
        error: "Unable to update avatar.",
        details: error.message,
        hint: isMissingTableError(error.message, "avatars")
          ? "Run the avatars migration to create public.avatars."
          : undefined,
      },
      { status: 400 }
    )
  }
  if (!data) {
    return NextResponse.json({ error: "Unable to update avatar." }, { status: 400 })
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
  if (!id) return NextResponse.json({ error: "Avatar id is required." }, { status: 400 })

  const { error } = await supabase.from("avatars").delete().eq("id", id).eq("creator_id", user.id)
  if (error) {
    return NextResponse.json(
      {
        error: "Unable to delete avatar.",
        details: error.message,
        hint: isMissingTableError(error.message, "avatars")
          ? "Run the avatars migration to create public.avatars."
          : undefined,
      },
      { status: 400 }
    )
  }
  return NextResponse.json({ success: true })
}
