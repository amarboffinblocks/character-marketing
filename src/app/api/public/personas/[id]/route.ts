import { NextResponse } from "next/server"

import { createAdminSupabaseClient } from "@/lib/supabase/admin"

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let supabase
  try {
    supabase = createAdminSupabaseClient()
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to initialize database client."
    return NextResponse.json({ error: "Unable to load persona.", details: message }, { status: 500 })
  }
  const { data, error } = await supabase
    .from("personas")
    .select("*")
    .eq("id", id)
    .in("visibility", ["public", "unlisted"])
    .maybeSingle()

  if (error) return NextResponse.json({ error: "Unable to load persona.", details: error.message }, { status: 400 })
  if (!data) return NextResponse.json({ item: null }, { status: 404 })

  return NextResponse.json({
    item: {
      id: asText(data.id),
      personaName: asText(data.persona_name),
      personaDetails: asText(data.persona_details),
      avatarUrl: asText(data.avatar_url),
      tags: Array.isArray(data.tags) ? data.tags.filter((v): v is string => typeof v === "string") : [],
      safety: asText(data.safety) || "SFW",
      visibility: asText(data.visibility) || "private",
      usageCount: Number(data.usage_count ?? 0) || 0,
      updatedAt: "now",
    },
  })
}
