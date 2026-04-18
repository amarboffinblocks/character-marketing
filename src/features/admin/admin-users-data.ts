export type AdminUserRecord = {
  id: string
  email: string
  displayName: string
  role: "buyer" | "creator" | "admin"
  status: "active" | "suspended"
  joinedAt: string
  lastActiveAt: string
  /** Lifetime orders placed (buyers) or received (creators); admins 0. */
  ordersCount: number
  /** Lifetime spend as buyer (USD); 0 if not applicable. */
  lifetimeSpendUsd: number
  timezone: string
  country: string
  twoFactorEnabled: boolean
  /** Internal support notes (demo). */
  notes: string
  /** Policy / fraud flags (demo). */
  flags: string[]
  /** When role is creator, links marketplace creator profile for combined admin view. */
  linkedCreatorId?: string
}

export const adminUserRecords: AdminUserRecord[] = [
  {
    id: "usr-1001",
    email: "ava.thompson@email.com",
    displayName: "Ava Thompson",
    role: "buyer",
    status: "active",
    joinedAt: "2026-04-02",
    lastActiveAt: "2026-04-18 · 09:14",
    ordersCount: 24,
    lifetimeSpendUsd: 3840,
    timezone: "America/Los_Angeles",
    country: "US",
    twoFactorEnabled: true,
    notes: "Regular buyer; no chargebacks in 90d.",
    flags: [],
  },
  {
    id: "usr-1002",
    email: "marcus.vega@email.com",
    displayName: "Marcus Vega",
    role: "creator",
    status: "active",
    joinedAt: "2026-03-18",
    lastActiveAt: "2026-04-18 · 08:02",
    ordersCount: 215,
    lifetimeSpendUsd: 0,
    timezone: "Europe/Berlin",
    country: "DE",
    twoFactorEnabled: true,
    notes: "Top-quartile GMV; verified tax docs on file.",
    flags: [],
    linkedCreatorId: "nova-scribe",
  },
  {
    id: "usr-1003",
    email: "ops@character.market",
    displayName: "Ops Bot",
    role: "admin",
    status: "active",
    joinedAt: "2025-01-10",
    lastActiveAt: "2026-04-18 · 06:00",
    ordersCount: 0,
    lifetimeSpendUsd: 0,
    timezone: "Etc/UTC",
    country: "US",
    twoFactorEnabled: true,
    notes: "Break-glass automation account.",
    flags: ["elevated"],
  },
  {
    id: "usr-1004",
    email: "spam@example.com",
    displayName: "Flagged User",
    role: "buyer",
    status: "suspended",
    joinedAt: "2026-02-04",
    lastActiveAt: "2026-04-10 · 22:41",
    ordersCount: 3,
    lifetimeSpendUsd: 120,
    timezone: "Asia/Singapore",
    country: "SG",
    twoFactorEnabled: false,
    notes: "Suspended · off-platform payment solicitations.",
    flags: ["tos_strike", "suspended"],
  },
  {
    id: "usr-1005",
    email: "mia.robinson@email.com",
    displayName: "Mia Robinson",
    role: "buyer",
    status: "active",
    joinedAt: "2026-04-12",
    lastActiveAt: "2026-04-17 · 19:22",
    ordersCount: 6,
    lifetimeSpendUsd: 890,
    timezone: "America/New_York",
    country: "US",
    twoFactorEnabled: false,
    notes: "",
    flags: [],
  },
  {
    id: "usr-1006",
    email: "li.wei@email.com",
    displayName: "Li Wei",
    role: "buyer",
    status: "active",
    joinedAt: "2026-01-20",
    lastActiveAt: "2026-04-18 · 04:55",
    ordersCount: 41,
    lifetimeSpendUsd: 6200,
    timezone: "Asia/Shanghai",
    country: "CN",
    twoFactorEnabled: true,
    notes: "Whale segment; priority support tag.",
    flags: ["vip"],
  },
  {
    id: "usr-1007",
    email: "sofia.m@studio.co",
    displayName: "Sofia Martín",
    role: "creator",
    status: "active",
    joinedAt: "2025-11-02",
    lastActiveAt: "2026-04-18 · 07:30",
    ordersCount: 178,
    lifetimeSpendUsd: 0,
    timezone: "Europe/Madrid",
    country: "ES",
    twoFactorEnabled: true,
    notes: "Seasonal availability toggled weekly.",
    flags: [],
    linkedCreatorId: "luna-pixel",
  },
  {
    id: "usr-1008",
    email: "jordan.kim@email.com",
    displayName: "Jordan Kim",
    role: "buyer",
    status: "active",
    joinedAt: "2026-03-01",
    lastActiveAt: "2026-04-16 · 12:08",
    ordersCount: 0,
    lifetimeSpendUsd: 0,
    timezone: "Australia/Sydney",
    country: "AU",
    twoFactorEnabled: false,
    notes: "Browsing only; cart abandoned x4.",
    flags: [],
  },
  {
    id: "usr-1009",
    email: "support-vendor@partner.io",
    displayName: "Partner Read-only",
    role: "admin",
    status: "active",
    joinedAt: "2026-02-15",
    lastActiveAt: "2026-04-17 · 15:00",
    ordersCount: 0,
    lifetimeSpendUsd: 0,
    timezone: "America/Chicago",
    country: "US",
    twoFactorEnabled: true,
    notes: "Scoped admin; no payouts access.",
    flags: ["scoped_admin"],
  },
  {
    id: "usr-1010",
    email: "zephyr@creators.gg",
    displayName: "Zephyr Cole",
    role: "creator",
    status: "active",
    joinedAt: "2025-08-11",
    lastActiveAt: "2026-04-18 · 10:11",
    ordersCount: 421,
    lifetimeSpendUsd: 0,
    timezone: "Europe/London",
    country: "GB",
    twoFactorEnabled: true,
    notes: "Featured in marketplace carousel Q1.",
    flags: [],
    linkedCreatorId: "myth-weaver",
  },
]

/** @deprecated Use adminUserRecords — kept for any legacy imports. */
export const adminUsers = adminUserRecords

export function getAdminUserRecord(id: string): AdminUserRecord | undefined {
  return adminUserRecords.find((u) => u.id === id)
}
