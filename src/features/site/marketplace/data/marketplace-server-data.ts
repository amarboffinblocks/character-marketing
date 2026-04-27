import { buildCreatorProfile } from "@/features/site/creator-profile/profile"
import type { CreatorProfile } from "@/features/site/creator-profile/types"
import type { Creator, CreatorMarketplaceCategory } from "@/features/site/marketplace/types"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

type ProfilesRow = {
  id: string
  profile_data: Record<string, unknown> | null
}

type CreatorProfileData = {
  displayName?: unknown
  tagline?: unknown
  avatarUrl?: unknown
  bannerUrl?: unknown
  responseTime?: unknown
  languages?: unknown
  profileVisibility?: unknown
  skills?: unknown
  niche?: unknown
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
}

function toHandle(userId: string): string {
  return `creator-${userId.slice(0, 8)}`
}

function toCreator(row: ProfilesRow): Creator | null {
  const profileData = row.profile_data ?? {}
  const creatorData = (profileData.creator ?? {}) as CreatorProfileData
  const visibility = asString(creatorData.profileVisibility).toLowerCase()
  if (visibility && visibility !== "public") return null

  const skills = asStringArray(creatorData.skills)
  const languages = asStringArray(creatorData.languages)
  const niche = asString(creatorData.niche)
  const specialties = Array.from(new Set([...skills, ...(niche ? [niche] : [])]))

  const name = asString(creatorData.displayName) || toHandle(row.id)
  const tagline = asString(creatorData.tagline)
  const responseTime = asString(creatorData.responseTime) || "< 24 hrs"

  return {
    id: row.id,
    name,
    handle: toHandle(row.id),
    tagline: tagline || "Creator profile",
    languages,
    avatar: asString(creatorData.avatarUrl) || "/placeholder.svg",
    coverImage: asString(creatorData.bannerUrl) || "/placeholder.svg",
    rating: 4.8,
    reviewCount: 0,
    startingPrice: 25,
    responseTime,
    isVerified: true,
    isAvailable: true,
    specialties: specialties.length > 0 ? specialties : ["Creator"],
    completedOrders: 0,
  }
}

function toTagId(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function getMarketplaceCreators(): Promise<Creator[]> {
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, profile_data")
    .eq("role", "creator")
    .returns<ProfilesRow[]>()

  if (error || !data) return []

  return data.map(toCreator).filter((creator): creator is Creator => creator !== null)
}

export function buildTags(creators: Creator[]): CreatorMarketplaceCategory[] {
  const tagCounts = new Map<string, number>()
  for (const creator of creators) {
    for (const tag of creator.specialties) {
      const normalized = tag.trim()
      if (!normalized) continue
      tagCounts.set(normalized, (tagCounts.get(normalized) ?? 0) + 1)
    }
  }

  return [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 20)
    .map(([name, count]) => ({
      id: toTagId(name) || name.toLowerCase(),
      name,
      description: `Creators tagged with ${name}`,
      count,
      icon: "Tag",
    }))
}

export async function getMarketplaceCreatorProfileById(creatorId: string): Promise<CreatorProfile | null> {
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, profile_data")
    .eq("id", creatorId)
    .eq("role", "creator")
    .maybeSingle<ProfilesRow>()

  if (error || !data) return null
  const creator = toCreator(data)
  if (!creator) return null
  return buildCreatorProfile(creator)
}
