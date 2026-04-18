/** Admin-only metadata layered on marketplace creators (demo). */

export type AdminCreatorExtra = {
  linkedUserId?: string
  payoutTier: "standard" | "priority" | "enterprise"
  openDisputes: number
  lastPayoutAt: string
  ytdGmvUsd: number
  internalNotes: string
}

const defaults: AdminCreatorExtra = {
  payoutTier: "standard",
  openDisputes: 0,
  lastPayoutAt: "—",
  ytdGmvUsd: 0,
  internalNotes: "",
}

const extras: Partial<Record<string, Partial<AdminCreatorExtra>>> = {
  "luna-pixel": {
    linkedUserId: "usr-1007",
    payoutTier: "priority",
    openDisputes: 0,
    lastPayoutAt: "Apr 15, 2026",
    ytdGmvUsd: 128400,
    internalNotes: "High CSAT; fast response SLA.",
  },
  "nova-scribe": {
    linkedUserId: "usr-1002",
    payoutTier: "priority",
    openDisputes: 1,
    lastPayoutAt: "Apr 17, 2026",
    ytdGmvUsd: 96200,
    internalNotes: "One open dispute on ORD-2999 chain.",
  },
  "myth-weaver": {
    linkedUserId: "usr-1010",
    payoutTier: "enterprise",
    openDisputes: 0,
    lastPayoutAt: "Apr 16, 2026",
    ytdGmvUsd: 201000,
    internalNotes: "Largest catalog in fantasy vertical.",
  },
  "echo-art": {
    payoutTier: "standard",
    openDisputes: 2,
    lastPayoutAt: "Apr 10, 2026",
    ytdGmvUsd: 54000,
    internalNotes: "Availability often closed — backlog risk.",
  },
}

export function getAdminCreatorExtra(creatorId: string): AdminCreatorExtra {
  const row = extras[creatorId]
  if (!row) {
    return {
      ...defaults,
      internalNotes: "No extra admin notes on file.",
    }
  }
  return {
    ...defaults,
    ...row,
    internalNotes: row.internalNotes ?? defaults.internalNotes,
  }
}
