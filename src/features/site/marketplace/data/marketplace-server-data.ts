import { buildCreatorProfile } from "@/features/site/creator-profile/profile"
import type {
  CreatorProfile,
  CreatorProfilePortfolioItem,
  CreatorServicePackage,
} from "@/features/site/creator-profile/types"
import type { Creator, CreatorMarketplaceCategory } from "@/features/site/marketplace/types"
import {
  computeCompletion,
  defaultProfileForm,
  type CreatorProfileForm,
} from "@/features/creator/profile/profile-data"
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

type CreatorServiceRow = {
  id: unknown
  service_name: unknown
  description: unknown
  price: unknown
  discounted_price: unknown
  tokens_label: unknown
  persona_count: unknown
  lorebook_count: unknown
  background_count: unknown
  avatar_count: unknown
  character_count: unknown
  highlights: unknown
  is_recommended: unknown
  updated_at: unknown
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

function asNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toHandle(userId: string): string {
  return `creator-${userId.slice(0, 8)}`
}

function toCreatorCompletionForm(creatorData: Record<string, unknown>): CreatorProfileForm {
  const portfolio = Array.isArray(creatorData.portfolio) ? creatorData.portfolio : []
  const socialLinks = Array.isArray(creatorData.socialLinks) ? creatorData.socialLinks : []

  return {
    ...defaultProfileForm,
    displayName: asString(creatorData.displayName),
    tagline: asString(creatorData.tagline),
    avatarUrl: asString(creatorData.avatarUrl),
    bannerUrl: asString(creatorData.bannerUrl),
    shortBio: asString(creatorData.shortBio),
    longBio: asString(creatorData.longBio),
    timezone: asString(creatorData.timezone),
    responseTime: asString(creatorData.responseTime),
    languages: asStringArray(creatorData.languages),
    skills: asStringArray(creatorData.skills),
    niche: asString(creatorData.niche),
    contentPreference:
      asString(creatorData.contentPreference) === "SFW" ||
      asString(creatorData.contentPreference) === "NSFW" ||
      asString(creatorData.contentPreference) === "Both"
        ? (asString(creatorData.contentPreference) as CreatorProfileForm["contentPreference"])
        : defaultProfileForm.contentPreference,
    profileVisibility:
      asString(creatorData.profileVisibility) === "private" ? "private" : "public",
    responseRate: asNumber(creatorData.responseRate, 0),
    onTimeDelivery: asNumber(creatorData.onTimeDelivery, 0),
    repeatBuyerRate: asNumber(creatorData.repeatBuyerRate, 0),
    socialLinks: socialLinks as CreatorProfileForm["socialLinks"],
    portfolio: portfolio as CreatorProfileForm["portfolio"],
    buyerRequirements: asString(creatorData.buyerRequirements),
    revisionPolicy: asString(creatorData.revisionPolicy),
    refundPolicy: asString(creatorData.refundPolicy),
    email: asString(creatorData.email),
  }
}

function toCreator(row: ProfilesRow): Creator | null {
  const profileData = row.profile_data ?? {}
  const creatorData = (profileData.creator ?? {}) as CreatorProfileData
  const visibility = asString(creatorData.profileVisibility).toLowerCase()
  if (visibility && visibility !== "public") return null
  const completion = computeCompletion(
    toCreatorCompletionForm(profileData.creator && typeof profileData.creator === "object" ? profileData.creator as Record<string, unknown> : {})
  )
  if (completion.percent < 80) return null

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

function buildIncludedItemsFromService(row: CreatorServiceRow): string[] {
  const counts = [
    { label: "persona", value: asNumber(row.persona_count, 0) },
    { label: "lorebook", value: asNumber(row.lorebook_count, 0) },
    { label: "background", value: asNumber(row.background_count, 0) },
    { label: "avatar", value: asNumber(row.avatar_count, 0) },
    { label: "character", value: asNumber(row.character_count, 0) },
  ].filter((item) => item.value > 0)

  return counts.map((item) => `${item.value} ${item.label}${item.value === 1 ? "" : "s"} included`)
}



function mapCreatorServiceToCustomPackage(row: CreatorServiceRow): CreatorServicePackage {
  const basePrice = asNumber(row.price, 0)
  const discountedPrice = row.discounted_price === null ? null : asNumber(row.discounted_price, 0)
  const validDiscountedPrice =
    discountedPrice && discountedPrice > 0 && discountedPrice < basePrice
      ? discountedPrice
      : null

  return {
    id: asString(row.id),
    title: asString(row.service_name) || "Custom Package",
    price: basePrice,
    discountedPrice: validDiscountedPrice,
    description: asString(row.description),
    scopeLabel: "",
    tokensLabel: asString(row.tokens_label),
    // Keep these unset-like (0) unless records actually provide these fields.
    deliveryDays: 0,
    revisionCount: 0,
    includedHeading: "WHAT'S INCLUDED",
    includedItems: buildIncludedItemsFromService(row),
    packageHighlights: asStringArray(row.highlights),
    isRecommended: Boolean(row.is_recommended),
  }
}

function mapPortfolioItems(value: unknown): CreatorProfilePortfolioItem[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null
      const record = item as Record<string, unknown>
      const imageUrl = asString(record.imageUrl)
      if (!imageUrl) return null

      const skills = asStringArray(record.skills)
      const category = asString(record.type) || "character"

      return {
        id: asString(record.id) || `portfolio-${index + 1}`,
        title: asString(record.title) || `Portfolio piece ${index + 1}`,
        category,
        skills,
        description: asString(record.summary),
        imageUrl,
      } satisfies CreatorProfilePortfolioItem
    })
    .filter((item): item is CreatorProfilePortfolioItem => item !== null)
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

  const { data: serviceRows } = await supabase
    .from("creator_services")
    .select(
      [
        "id",
        "service_name",
        "description",
        "price",
        "discounted_price",
        "tokens_label",
        "persona_count",
        "lorebook_count",
        "background_count",
        "avatar_count",
        "character_count",
        "highlights",
        "is_recommended",
        "updated_at",
      ].join(",")
    )
    .eq("creator_id", creatorId)
    .order("is_recommended", { ascending: false })
    .order("updated_at", { ascending: false })
    .returns<CreatorServiceRow[]>()

  const profile = buildCreatorProfile(creator)
  const creatorData =
    data.profile_data &&
    typeof data.profile_data === "object" &&
    data.profile_data.creator &&
    typeof data.profile_data.creator === "object"
      ? (data.profile_data.creator as Record<string, unknown>)
      : {}
  const dbPortfolioItems = mapPortfolioItems(creatorData.portfolio)
  const dbPortfolioUrls = dbPortfolioItems.map((item) => item.imageUrl)
  const preselectPackage = profile.packages[0]
  const dbCustomPackages = (serviceRows ?? [])
    .map(mapCreatorServiceToCustomPackage)
    .filter((pkg) => pkg.id.length > 0)

  return {
    ...profile,
    portfolioImageUrls: dbPortfolioUrls.length > 0 ? dbPortfolioUrls : profile.portfolioImageUrls,
    portfolioItems: dbPortfolioItems.length > 0 ? dbPortfolioItems : profile.portfolioItems,
    packages: preselectPackage
      ? [preselectPackage, ...dbCustomPackages]
      : dbCustomPackages,
  }
}
