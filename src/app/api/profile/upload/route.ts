import { NextResponse } from "next/server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const MAX_BYTES = 5 * 1024 * 1024

function extensionFromMime(mime: string): string {
  if (mime === "image/png") return "png"
  if (mime === "image/webp") return "webp"
  return "jpg"
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file")
  const kind = formData.get("kind")

  if (!(file instanceof File) || (kind !== "avatar" && kind !== "banner" && kind !== "portfolio")) {
    return NextResponse.json({ error: "Invalid upload payload" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type) || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Unsupported file type or size" }, { status: 400 })
  }

  const ext = extensionFromMime(file.type)
  const path = `${user.id}/${kind}-${Date.now()}.${ext}`
  const fileBuffer = await file.arrayBuffer()

  const { error } = await supabase.storage.from("profile-media").upload(path, fileBuffer, {
    contentType: file.type,
    upsert: true,
  })

  if (error) {
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error.message,
        hint: "Ensure profile-media bucket exists and storage policies are applied.",
      },
      { status: 400 }
    )
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("profile-media").getPublicUrl(path)

  return NextResponse.json({ url: publicUrl, path })
}
