import { NextResponse } from "next/server"

import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let supabase
  try {
    supabase = createAdminSupabaseClient()
  } catch {
    try {
      supabase = await createServerSupabaseClient()
    } catch (fallbackError) {
      const message =
        fallbackError instanceof Error ? fallbackError.message : "Unable to initialize database client."
      return NextResponse.json({ error: "Unable to load avatar.", details: message }, { status: 500 })
    }
  }
  const { data, error } = await supabase
    .from("avatars")
    .select("*")
    .eq("id", id)
    .in("visibility", ["public", "unlisted"])
    .maybeSingle()

  if (error) return NextResponse.json({ error: "Unable to load avatar.", details: error.message }, { status: 400 })
  if (!data) return NextResponse.json({ item: null }, { status: 404 })

  return NextResponse.json({
    item: {
      id: asText(data.id),
      avatarName: asText(data.avatar_name),
      imageUrl: asText(data.image_url),
      tags: Array.isArray(data.tags) ? data.tags.filter((value: unknown): value is string => typeof value === "string") : [],
      safety: asText(data.safety) || "SFW",
      visibility: asText(data.visibility) || "private",
      style: asText(data.style) || "semi-real",
      notes: asText(data.notes),
      updatedAt: "now",
    },
  })
}
