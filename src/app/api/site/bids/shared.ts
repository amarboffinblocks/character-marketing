import type { BidItem, BidPerson, BidStatus } from "@/features/site/bids/types"

type ProfileRow = {
  id: string
  profile_data: Record<string, unknown> | null
}

type InterestRow = {
  bid_id: string
  creator_id: string
  status: "interested" | "assigned" | "withdrawn"
}

export type BidPostRow = {
  id: string
  requester_id: string
  title: string
  duration: string
  budget: string
  token_count: string
  character_count: number
  persona_count: number
  lorebook_count: number
  background_count: number
  avatar_count: number
  skills_needed: string
  description: string
  is_price_negotiable: boolean
  status: BidStatus
  assigned_creator_id: string | null
  created_at: string
  updated_at: string
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {}
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export function mapProfileToPerson(profile: ProfileRow | undefined): BidPerson {
  const root = asObject(profile?.profile_data ?? {})
  const creator = asObject(root.creator)
  const user = asObject(root.user)
  return {
    id: profile?.id ?? "",
    name:
      asString(creator.displayName) ||
      asString(creator.name) ||
      asString(user.displayName) ||
      asString(user.name) ||
      "Creator",
    handle: asString(creator.handle) || asString(user.handle),
    avatarUrl: asString(creator.avatarUrl) || asString(user.avatarUrl),
    email: asString(user.email) || asString(root.email),
  }
}

export function mapBidRowsToItems(params: {
  bids: BidPostRow[]
  interests: InterestRow[]
  profiles: ProfileRow[]
}): BidItem[] {
  const profilesById = new Map(params.profiles.map((row) => [row.id, row]))
  const interestsByBid = new Map<string, InterestRow[]>()
  for (const interest of params.interests) {
    interestsByBid.set(interest.bid_id, [...(interestsByBid.get(interest.bid_id) ?? []), interest])
  }

  return params.bids.map((row) => {
    const bidInterests = interestsByBid.get(row.id) ?? []
    const interested = bidInterests
      .filter((item) => item.status === "interested")
      .map((item) => mapProfileToPerson(profilesById.get(item.creator_id)))
    const assignedCreator = row.assigned_creator_id
      ? mapProfileToPerson(profilesById.get(row.assigned_creator_id))
      : null

    return {
      id: row.id,
      title: row.title,
      duration: row.duration,
      budget: row.budget,
      tokenCount: row.token_count,
      character: row.character_count,
      persona: row.persona_count,
      lorebook: row.lorebook_count,
      background: row.background_count,
      avatar: row.avatar_count,
      skillsNeeded: row.skills_needed,
      description: row.description,
      isPriceNegotiable: row.is_price_negotiable,
      visibility: row.status === "global_bid" ? "open" : "closed",
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      interestedCount: interested.length,
      interestedCreators: interested.slice(0, 5),
      assignedCreator,
    }
  })
}
