import type { CreatorQuickAction } from "@/features/creator/dashboard/types"

export type AdminActivityRow = {
  id: string
  label: string
  meta: string
  time: string
}

export const adminQuickActions: CreatorQuickAction[] = [
  { label: "Open user directory", href: "/dashboard/admin/users" },
  { label: "Review creator applications", href: "/dashboard/admin/creators" },
  { label: "Order queue (platform-wide)", href: "/dashboard/admin/orders" },
  { label: "Trust & analytics", href: "/dashboard/admin/reports" },
  { label: "Admin settings", href: "/dashboard/admin/settings" },
]
export type AdminEscalation = {
  id: string
  title: string
  detail: string
  severity: "high" | "medium" | "low"
}

export const adminEscalations: AdminEscalation[] = [
  {
    id: "e1",
    title: "Payment processor webhook delays",
    detail: "12 stuck authorizations · retry queue",
    severity: "high",
  },
  {
    id: "e2",
    title: "Buyer dispute cluster",
    detail: "3 orders · same SKU · ORD-3008 chain",
    severity: "medium",
  },
  {
    id: "e3",
    title: "New creator ID backlog",
    detail: "14 applications over 48h SLA",
    severity: "medium",
  },
  {
    id: "e4",
    title: "Search index lag",
    detail: "Replica ~6 min behind primary",
    severity: "low",
  },
]

export type AdminModerationRow = {
  id: string
  type: "Message" | "Listing" | "Profile" | "Review"
  subject: string
  reporter: string
  age: string
}

export const adminModerationQueue: AdminModerationRow[] = [
  {
    id: "mod-901",
    type: "Message",
    subject: "Harassment in thread THR-8821",
    reporter: "buyer anonymized",
    age: "18m",
  },
  {
    id: "mod-900",
    type: "Listing",
    subject: "Possible IP mismatch · character pack",
    reporter: "rights@studio.example",
    age: "2h",
  },
  {
    id: "mod-899",
    type: "Review",
    subject: "1-star review · suspected competitor",
    reporter: "creator Luna Pixel",
    age: "5h",
  },
  {
    id: "mod-898",
    type: "Profile",
    subject: "Off-platform contact in bio",
    reporter: "automated scanner",
    age: "6h",
  },
  {
    id: "mod-897",
    type: "Message",
    subject: "Payment outside CM (TOS)",
    reporter: "trust-model v3",
    age: "1d",
  },
]

export type AdminHealthRow = {
  label: string
  value: string
  status: "ok" | "warn" | "down"
}

export const adminPlatformHealth: AdminHealthRow[] = [
  { label: "API p95 latency", value: "142 ms", status: "ok" },
  { label: "Error rate (5m)", value: "0.08%", status: "ok" },
  { label: "Job queue depth", value: "2.1k", status: "warn" },
  { label: "Blob CDN hit ratio", value: "94.2%", status: "ok" },
]

export type AdminCategoryVolume = {
  category: string
  sharePct: number
  orders: number
}

export const adminVolumeByCategory: AdminCategoryVolume[] = [
  { category: "Character art & cards", sharePct: 34, orders: 1180 },
  { category: "VTuber / avatars", sharePct: 22, orders: 762 },
  { category: "Lore & worldbuilding", sharePct: 18, orders: 624 },
  { category: "Emotes & packs", sharePct: 15, orders: 520 },
  { category: "Other", sharePct: 11, orders: 381 },
]

export type AdminRegionalPulse = {
  region: string
  sessions: string
  delta: string
}

export const adminRegionalPulse: AdminRegionalPulse[] = [
  { region: "North America", sessions: "41%", delta: "+2.1%" },
  { region: "Europe", sessions: "28%", delta: "+0.8%" },
  { region: "Asia Pacific", sessions: "22%", delta: "+4.4%" },
  { region: "LATAM", sessions: "9%", delta: "-0.3%" },
]

export const adminAnnouncements = [
  {
    id: "ann-1",
    title: "Tax season reporting",
    body: "1099-K export preview available for creators in Settings → Finance.",
  },
  {
    id: "ann-2",
    title: "Incident drill",
    body: "Tabletop exercise scheduled next Thursday; calendar invite sent to on-call.",
  },
]

