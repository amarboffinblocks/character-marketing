import { NextResponse } from "next/server"

import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {}
}

function requesterSummary(profileData: Record<string, unknown> | null) {
  const root = asObject(profileData)
  const user = asObject(root.user)

  const name =
    asString(user.displayName) ||
    asString(user.name) ||
    asString(root.displayName) ||
    asString(root.name) ||
    "Client"
  const email = asString(user.email) || asString(root.email) || ""

  return { name, email }
}

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const admin = createAdminSupabaseClient()
  let userId = ""
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    userId = user?.id ?? ""
  } catch {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    userId = session?.user?.id ?? ""
  }

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { data: bidRows, error: bidsError } = await admin
      .from("bid_posts")
      .select("id, requester_id, title, duration, budget, skills_needed, description, status, is_price_negotiable, created_at")
      .order("created_at", { ascending: false })

    if (bidsError) {
      return NextResponse.json({ error: bidsError.message }, { status: 400 })
    }

    const normalizedGlobalBids = (bidRows ?? []).filter((row) => {
      const normalizedStatus = String(row.status ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
      return normalizedStatus === "global_bid"
    })

    if (normalizedGlobalBids.length === 0) {
      return NextResponse.json({ bids: [] })
    }

    const requesterIds = Array.from(new Set(normalizedGlobalBids.map((row) => row.requester_id).filter(Boolean)))
    const bidIds = normalizedGlobalBids.map((row) => row.id)

    const [{ data: profileRows, error: profilesError }, { data: interestedRows, error: interestedError }, { data: selfInterestRows, error: selfInterestError }] =
      await Promise.all([
        requesterIds.length > 0
          ? admin.from("profiles").select("id, profile_data").in("id", requesterIds)
          : Promise.resolve({ data: [], error: null }),
        bidIds.length > 0
          ? admin
              .from("bid_interests")
              .select("bid_id, creator_id, status")
              .in("bid_id", bidIds)
              .eq("status", "interested")
          : Promise.resolve({ data: [], error: null }),
        bidIds.length > 0
          ? admin.from("bid_interests").select("bid_id, status").in("bid_id", bidIds).eq("creator_id", userId)
          : Promise.resolve({ data: [], error: null }),
      ])

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 400 })
    }
    if (interestedError) {
      return NextResponse.json({ error: interestedError.message }, { status: 400 })
    }
    if (selfInterestError) {
      return NextResponse.json({ error: selfInterestError.message }, { status: 400 })
    }

    const profileMap = new Map(
      (profileRows ?? []).map((row) => [row.id as string, (row.profile_data as Record<string, unknown> | null) ?? null])
    )
    const interestedCountByBid = new Map<string, number>()
    for (const row of interestedRows ?? []) {
      const bidId = String(row.bid_id ?? "")
      if (!bidId) continue
      interestedCountByBid.set(bidId, (interestedCountByBid.get(bidId) ?? 0) + 1)
    }
    const selfStatusByBid = new Map<string, string>()
    for (const row of selfInterestRows ?? []) {
      const bidId = String(row.bid_id ?? "")
      const status = asString(row.status)
      if (!bidId || !status) continue
      selfStatusByBid.set(bidId, status)
    }

    const bids = normalizedGlobalBids.map((row) => {
      const requester = requesterSummary(profileMap.get(String(row.requester_id ?? "")) ?? null)
      const normalizedStatus = String(row.status ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
      const bidId = String(row.id ?? "")
      const requesterId = String(row.requester_id ?? "")
      return {
        id: bidId,
        requesterId,
        requesterName: requester.name,
        requesterEmail: requester.email,
        title: asString(row.title),
        duration: asString(row.duration),
        budget: asString(row.budget),
        skillsNeeded: asString(row.skills_needed),
        description: asString(row.description),
        status: normalizedStatus || asString(row.status),
        isPriceNegotiable: Boolean(row.is_price_negotiable),
        createdAt: String(row.created_at ?? new Date().toISOString()),
        interestedCount: interestedCountByBid.get(bidId) ?? 0,
        creatorInterestStatus: selfStatusByBid.get(bidId) ?? null,
        isOwnBid: requesterId === userId,
      }
    })

    return NextResponse.json({ bids })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load global bids."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
