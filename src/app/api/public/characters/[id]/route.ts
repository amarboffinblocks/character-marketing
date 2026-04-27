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
    return NextResponse.json({ error: "Unable to load character.", details: message }, { status: 500 })
  }
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("id", id)
    .in("visibility", ["public", "unlisted"])
    .maybeSingle()

  if (error) return NextResponse.json({ error: "Unable to load character.", details: error.message }, { status: 400 })
  if (!data) return NextResponse.json({ item: null }, { status: 404 })

  return NextResponse.json({
    item: {
      id: asText(data.id),
      characterName: asText(data.character_name),
      handle: asText(data.handle),
      avatarUrl: asText(data.avatar_url),
      backgroundUrl: asText(data.background_url),
      visibility: asText(data.visibility) || "private",
      safety: asText(data.safety) || "SFW",
      tags: Array.isArray(data.tags) ? data.tags.filter((v): v is string => typeof v === "string") : [],
      description: asText(data.description),
      scenario: asText(data.scenario),
      personalitySummary: asText(data.personality_summary),
      firstMessage: asText(data.first_message),
      alternativeMessages: asText(data.alternative_messages),
      exampleDialogue: asText(data.example_dialogue),
      authorNotes: asText(data.author_notes),
      characterNotes: asText(data.character_notes),
      status: asText(data.status) || "draft",
      updatedAt: "now",
      usageCount: Number(data.usage_count ?? 0) || 0,
    },
  })
}
