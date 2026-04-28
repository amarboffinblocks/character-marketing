import { NextResponse } from "next/server"
import { z } from "zod"

import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const safetySchema = z.enum(["SFW", "NSFW"])

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value.length === 0 || /^https?:\/\/\S+$/i.test(value), "Use a valid URL")

const requestSchema = z.object({
  creatorId: z.string().uuid("Invalid creator id"),
  packageId: z.string().min(1, "Package id is required"),
  packageTitle: z.string().trim().min(1, "Package title is required"),
  packagePrice: z.number().int().nonnegative(),
  tokensLabel: z.string().trim().min(1, "Tokens label is required"),
  packageDescription: z.string().trim().default(""),
  limits: z.object({
    character: z.number().int().nonnegative(),
    persona: z.number().int().nonnegative(),
    lorebook: z.number().int().nonnegative(),
    avatar: z.number().int().nonnegative(),
    background: z.number().int().nonnegative(),
  }),
  requestPayload: z.object({
    character: z.array(
      z.object({
        messageToCreator: z.string().trim().min(5),
        characterName: z.string().trim().min(2),
        characterTags: z.string().trim().min(2),
        description: z.string().trim().min(20),
        scenarioLocationUniverse: z.string().trim().min(10),
        personalitySummary: z.string().trim().min(10),
        firstMessage: z.string().trim().min(10),
        alternativeFirstMessages: z.string().trim().optional(),
        exampleDialogueStyle: z.string().trim().min(10),
        safety: safetySchema,
      })
    ),
    persona: z.array(
      z.object({
        messageToCreator: z.string().trim().min(5),
        personaName: z.string().trim().min(2),
        personaTags: z.string().trim().min(2),
        personaDetails: z.string().trim().min(20),
        safety: safetySchema,
      })
    ),
    lorebook: z.array(
      z.object({
        messageToCreator: z.string().trim().min(5),
        estimatedKeywordCount: z.string().trim().min(1),
        lorebookName: z.string().trim().optional(),
        lorebookTags: z.string().trim().min(2),
        description: z.string().trim().min(20),
        specificKeywordsOrTerms: z.string().trim().min(10),
        safety: safetySchema,
      })
    ),
    background: z.array(
      z.object({
        messageToCreator: z.string().trim().min(5),
        backgroundName: z.string().trim().optional(),
        description: z.string().trim().min(20),
        referenceUrl1: optionalUrl,
        referenceUrl2: optionalUrl,
        referenceUrl3: optionalUrl,
        safety: safetySchema,
      })
    ),
    avatar: z.array(
      z.object({
        messageToCreator: z.string().trim().min(5),
        avatarName: z.string().trim().optional(),
        description: z.string().trim().min(20),
        referenceUrl1: optionalUrl,
        referenceUrl2: optionalUrl,
        referenceUrl3: optionalUrl,
        safety: safetySchema,
      })
    ),
  }),
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

  if (
    payload.requestPayload.character.length > payload.limits.character ||
    payload.requestPayload.persona.length > payload.limits.persona ||
    payload.requestPayload.lorebook.length > payload.limits.lorebook ||
    payload.requestPayload.avatar.length > payload.limits.avatar ||
    payload.requestPayload.background.length > payload.limits.background
  ) {
    return NextResponse.json({ error: "Request exceeds package limits." }, { status: 400 })
  }

  const adminSupabase = createAdminSupabaseClient()
  const { error } = await adminSupabase.from("custom_package_requests").insert({
    creator_id: payload.creatorId,
    requester_id: user.id,
    package_id: payload.packageId,
    package_title: payload.packageTitle,
    package_price: payload.packagePrice,
    tokens_label: payload.tokensLabel,
    request_payload: {
      packageDescription: payload.packageDescription,
      limits: payload.limits,
      details: payload.requestPayload,
    },
    status: "submitted",
  })

  if (error) {
    return NextResponse.json(
      { error: "Unable to submit custom package request.", details: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}
