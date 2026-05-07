import type { Creator } from "@/features/site/marketplace/types"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import pg from "pg"

function getConnectionString() {
  return process.env.DIRECT_URL || process.env.DATABASE_URL
}

export type AdminDirectoryUser = {
  id: string
  email: string
  displayName: string
  avatarUrl: string
  role: "buyer" | "creator" | "admin"
  status: "active" | "suspended"
  joinedAt: string
  lastActiveAt: string
  ordersCount: number
  lifetimeSpendUsd: number
  timezone: string
  country: string
  twoFactorEnabled: boolean
  notes: string
  flags: string[]
  linkedCreatorId?: string
  rawProfileData: Record<string, unknown>
}

type ProfileRow = {
  id: string
  role: string | null
  profile_data: Record<string, unknown> | null
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function asNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function asBoolean(value: unknown): boolean {
  return typeof value === "boolean" ? value : false
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
}

function formatDate(value: unknown): string {
  const raw = asString(value)
  if (!raw) return "—"
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return "—"
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
}

function formatDateTime(value: unknown): string {
  const raw = asString(value)
  if (!raw) return "—"
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return "—"
  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function mapRole(role: string | null): AdminDirectoryUser["role"] {
  if (role === "creator") return "creator"
  if (role === "admin") return "admin"
  return "buyer"
}

function getRoleData(profileData: Record<string, unknown> | null, role: AdminDirectoryUser["role"]) {
  if (!profileData) return {}
  if (role === "creator" && profileData.creator && typeof profileData.creator === "object") {
    return profileData.creator as Record<string, unknown>
  }
  if (role === "admin" && profileData.admin && typeof profileData.admin === "object") {
    return profileData.admin as Record<string, unknown>
  }
  if (profileData.user && typeof profileData.user === "object") {
    return profileData.user as Record<string, unknown>
  }
  return profileData
}

function mapUser(row: ProfileRow): AdminDirectoryUser {
  const role = mapRole(row.role)
  const roleData = getRoleData(row.profile_data, role)
  const flags = asStringArray(roleData.flags)
  const status: AdminDirectoryUser["status"] = flags.includes("suspended") ? "suspended" : "active"
  const displayName =
    asString(roleData.displayName) ||
    asString(roleData.name) ||
    (role === "creator" ? `Creator ${row.id.slice(0, 8)}` : `User ${row.id.slice(0, 8)}`)

  const linkedCreatorId =
    role === "creator"
      ? row.id
      : asString(roleData.linkedCreatorId) || undefined

  return {
    id: row.id,
    email: asString(roleData.email),
    displayName,
    avatarUrl: asString(roleData.avatarUrl),
    role,
    status,
    joinedAt: formatDate(roleData.joinedAt),
    lastActiveAt: formatDateTime(roleData.lastActiveAt),
    ordersCount: asNumber(roleData.ordersCount),
    lifetimeSpendUsd: asNumber(roleData.lifetimeSpendUsd),
    timezone: asString(roleData.timezone) || "—",
    country: asString(roleData.country) || "—",
    twoFactorEnabled: asBoolean(roleData.twoFactorEnabled),
    notes: asString(roleData.notes),
    flags,
    linkedCreatorId,
    rawProfileData: row.profile_data ?? {},
  }
}

function mapCreator(row: ProfileRow): Creator {
  const creatorData = getRoleData(row.profile_data, "creator")
  const skills = asStringArray(creatorData.skills)
  const niche = asString(creatorData.niche)
  const specialties = Array.from(new Set([...skills, ...(niche ? [niche] : [])]))

  const name = asString(creatorData.displayName) || `Creator ${row.id.slice(0, 8)}`
  const handle = asString(creatorData.handle) || `creator-${row.id.slice(0, 8)}`

  return {
    id: row.id,
    name,
    email: asString(creatorData.email),
    handle,
    tagline: asString(creatorData.tagline) || "Creator profile",
    shortBio: asString(creatorData.shortBio) || asString(creatorData.tagline) || "Professional Creator",
    longBio: asString(creatorData.longBio) || asString(creatorData.bio) || "No biography provided.",
    languages: asStringArray(creatorData.languages),
    avatar: asString(creatorData.avatarUrl) || "/placeholder.svg",
    coverImage: asString(creatorData.bannerUrl) || "/placeholder.svg",
    rating: asNumber(creatorData.rating) || 0,
    reviewCount: asNumber(creatorData.reviewCount),
    startingPrice: asNumber(creatorData.startingPrice) || 0,
    responseTime: asString(creatorData.responseTime) || "< 24 hrs",
    isVerified: asBoolean(creatorData.isVerified),
    isAvailable: creatorData.isAvailable === false ? false : true,
    visibility:
      asString(creatorData.profileVisibility) === "private"
        ? "private"
        : asString(creatorData.profileVisibility) === "unlisted"
          ? "unlisted"
          : "public",
    specialties: specialties.length > 0 ? specialties : ["Creator"],
    completedOrders: asNumber(creatorData.completedOrders),
  }
}

export async function getAdminDirectoryUsers(options?: { excludeCreators?: boolean }): Promise<AdminDirectoryUser[]> {
  const connectionString = getConnectionString()
  if (!connectionString) throw new Error("Missing DIRECT_URL or DATABASE_URL")

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    const result = await client.query(`
      SELECT 
        p.id, 
        p.role, 
        p.profile_data,
        COALESCE(oc.total_orders, 0)::int as live_orders_count,
        COALESCE(pt.total_spend, 0)::float as live_lifetime_spend
      FROM public.profiles p
      LEFT JOIN (
        SELECT buyer_id, COUNT(*) as total_orders 
        FROM public.orders 
        GROUP BY buyer_id
      ) oc ON oc.buyer_id = p.id
      LEFT JOIN (
        SELECT buyer_id, SUM(amount) as total_spend 
        FROM public.payment_transactions 
        WHERE status = 'succeeded' 
        GROUP BY buyer_id
      ) pt ON pt.buyer_id = p.id
    `)

    const users = (result.rows ?? []).map((row: any) => {
      const user = mapUser(row)
      return {
        ...user,
        ordersCount: row.live_orders_count,
        lifetimeSpendUsd: row.live_lifetime_spend,
      }
    })

    const filtered = options?.excludeCreators ? users.filter((user) => user.role !== "creator") : users
    return filtered.sort((a, b) => a.displayName.localeCompare(b.displayName))
  } catch (error) {
    console.error("[getAdminDirectoryUsers] Error:", error)
    return []
  } finally {
    await client.end().catch(() => {})
  }
}

export async function getAdminDirectoryUserById(userId: string): Promise<AdminDirectoryUser | null> {
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, profile_data")
    .eq("id", userId)
    .maybeSingle<ProfileRow>()

  if (error || !data) return null
  return mapUser(data)
}

export async function getAdminCreators(): Promise<Creator[]> {
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, profile_data")
    .eq("role", "creator")
    .returns<ProfileRow[]>()

  if (error || !data) return []
  return data.map(mapCreator).sort((a, b) => a.name.localeCompare(b.name))
}

export async function getAdminCreatorById(creatorId: string): Promise<Creator | null> {
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, profile_data")
    .eq("id", creatorId)
    .eq("role", "creator")
    .maybeSingle<ProfileRow>()

  if (error || !data) return null
  return mapCreator(data)
}
