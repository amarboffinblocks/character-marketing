import type { CreatorAvatar } from "@/features/creator/workspace/avatars/avatars-data"
import { creatorAvatars } from "@/features/creator/workspace/avatars/avatars-data"
import type { CreatorBackground } from "@/features/creator/workspace/backgrounds/backgrounds-data"
import { creatorBackgrounds } from "@/features/creator/workspace/backgrounds/backgrounds-data"
import type { CreatorCharacter } from "@/features/creator/workspace/characters/characters-data"
import { creatorCharacters } from "@/features/creator/workspace/characters/characters-data"
import type { CreatorLorebook } from "@/features/creator/workspace/lorebooks/lorebooks-data"
import { creatorLorebooks } from "@/features/creator/workspace/lorebooks/lorebooks-data"
import type { CreatorPersona } from "@/features/creator/workspace/personas/personas-data"
import { creatorPersonas } from "@/features/creator/workspace/personas/personas-data"

export const inventoryCategories = [
  "character",
  "persona",
  "lorebook",
  "avatar",
  "background",
] as const

export type InventoryCategory = (typeof inventoryCategories)[number]

export function isInventoryCategory(value: string): value is InventoryCategory {
  return (inventoryCategories as readonly string[]).includes(value)
}

export type PurchaseMeta = {
  purchasedAt: string
  orderId: string
  sellerDisplayName: string
  sellerHandle: string
}

/** Demo: subset of workspace IDs treated as purchased library items. */
export const purchasedIds: Record<InventoryCategory, readonly string[]> = {
  character: ["char-1", "char-2"],
  persona: ["persona-1", "persona-2"],
  lorebook: ["lorebook-1"],
  avatar: ["avatar-1"],
  background: ["bg-1"],
}

const purchaseMetaById: Record<string, PurchaseMeta> = {
  "char-1": {
    purchasedAt: "Apr 12, 2026",
    orderId: "CM-1042",
    sellerDisplayName: "Luna Pixel",
    sellerHandle: "@lunapixel",
  },
  "char-2": {
    purchasedAt: "Apr 10, 2026",
    orderId: "CM-1038",
    sellerDisplayName: "Nova Scribe",
    sellerHandle: "@novascribe",
  },
  "persona-1": {
    purchasedAt: "Apr 8, 2026",
    orderId: "CM-1021",
    sellerDisplayName: "Echo Art",
    sellerHandle: "@echoart",
  },
  "persona-2": {
    purchasedAt: "Apr 5, 2026",
    orderId: "CM-1014",
    sellerDisplayName: "Luna Pixel",
    sellerHandle: "@lunapixel",
  },
  "lorebook-1": {
    purchasedAt: "Apr 3, 2026",
    orderId: "CM-1002",
    sellerDisplayName: "Nova Scribe",
    sellerHandle: "@novascribe",
  },
  "avatar-1": {
    purchasedAt: "Mar 28, 2026",
    orderId: "CM-0981",
    sellerDisplayName: "Aria Writes",
    sellerHandle: "@ariawrites",
  },
  "bg-1": {
    purchasedAt: "Mar 22, 2026",
    orderId: "CM-0966",
    sellerDisplayName: "Zephyr Studio",
    sellerHandle: "@zephyrstudio",
  },
}

export type InventoryListEntry = {
  category: InventoryCategory
  id: string
  title: string
  description: string
  coverImage?: string
  thumbUrl?: string
  safety: string
  tags: string[]
  purchasedAt: string
  orderId: string
  sellerDisplayName: string
  sellerHandle: string
}

/**
 * Uses Picsum Photos with a stable seed so each inventory row gets a distinct image
 * that does not change between visits. Falls back only when workspace has no URL.
 */
export function resolveInventoryImageUrl(
  id: string,
  category: InventoryCategory,
  workspaceUrl: string | undefined | null,
  size: "card" | "hero"
): string {
  const trimmed = workspaceUrl?.trim()
  if (trimmed) return trimmed

  const seed = `${category}-${id}`
  const [w, h] = size === "hero" ? ([1600, 600] as const) : ([800, 450] as const)
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`
}

function thumbForCharacter(c: CreatorCharacter) {
  return c.avatarUrl
}

function thumbForPersona(p: CreatorPersona) {
  return p.avatarUrl || undefined
}

function thumbForLorebook(l: CreatorLorebook) {
  return l.avatarUrl || undefined
}

function thumbForAvatar(a: CreatorAvatar) {
  return a.imageUrl || undefined
}

function thumbForBackground(b: CreatorBackground) {
  return b.imageUrl || undefined
}

function buildList(): InventoryListEntry[] {
  const out: InventoryListEntry[] = []

  for (const id of purchasedIds.character) {
    const c = creatorCharacters.find((x) => x.id === id)
    const meta = purchaseMetaById[id]
    if (!c || !meta) continue
    out.push({
      category: "character",
      id: c.id,
      title: c.characterName,
      description: c.description,
      thumbUrl: resolveInventoryImageUrl(c.id, "character", thumbForCharacter(c), "card"),
      safety: c.safety,
      tags: c.tags,
      purchasedAt: meta.purchasedAt,
      orderId: meta.orderId,
      sellerDisplayName: meta.sellerDisplayName,
      sellerHandle: meta.sellerHandle,
    })
  }

  for (const id of purchasedIds.persona) {
    const p = creatorPersonas.find((x) => x.id === id)
    const meta = purchaseMetaById[id]
    if (!p || !meta) continue
    out.push({
      category: "persona",
      id: p.id,
      title: p.personaName,
      description: p.personaDetails,
      thumbUrl: resolveInventoryImageUrl(p.id, "persona", thumbForPersona(p), "card"),
      safety: p.safety,
      tags: p.tags,
      purchasedAt: meta.purchasedAt,
      orderId: meta.orderId,
      sellerDisplayName: meta.sellerDisplayName,
      sellerHandle: meta.sellerHandle,
    })
  }

  for (const id of purchasedIds.lorebook) {
    const l = creatorLorebooks.find((x) => x.id === id)
    const meta = purchaseMetaById[id]
    if (!l || !meta) continue
    out.push({
      category: "lorebook",
      id: l.id,
      title: l.lorebookName,
      description: l.entries[0]?.context ?? "Lore entries included with purchase.",
      thumbUrl: resolveInventoryImageUrl(l.id, "lorebook", thumbForLorebook(l), "card"),
      safety: l.safety,
      tags: l.tags,
      purchasedAt: meta.purchasedAt,
      orderId: meta.orderId,
      sellerDisplayName: meta.sellerDisplayName,
      sellerHandle: meta.sellerHandle,
    })
  }

  for (const id of purchasedIds.avatar) {
    const a = creatorAvatars.find((x) => x.id === id)
    const meta = purchaseMetaById[id]
    if (!a || !meta) continue
    out.push({
      category: "avatar",
      id: a.id,
      title: a.avatarName,
      description: a.notes,
      thumbUrl: resolveInventoryImageUrl(a.id, "avatar", thumbForAvatar(a), "card"),
      safety: a.safety,
      tags: a.tags,
      purchasedAt: meta.purchasedAt,
      orderId: meta.orderId,
      sellerDisplayName: meta.sellerDisplayName,
      sellerHandle: meta.sellerHandle,
    })
  }

  for (const id of purchasedIds.background) {
    const b = creatorBackgrounds.find((x) => x.id === id)
    const meta = purchaseMetaById[id]
    if (!b || !meta) continue
    out.push({
      category: "background",
      id: b.id,
      title: b.backgroundName,
      description: b.notes,
      thumbUrl: resolveInventoryImageUrl(b.id, "background", thumbForBackground(b), "card"),
      safety: b.safety,
      tags: b.tags,
      purchasedAt: meta.purchasedAt,
      orderId: meta.orderId,
      sellerDisplayName: meta.sellerDisplayName,
      sellerHandle: meta.sellerHandle,
    })
  }

  return out
}

const listCache = buildList()

export function getInventoryList(): InventoryListEntry[] {
  return listCache
}

export function getInventoryListFiltered(tab: "all" | InventoryCategory): InventoryListEntry[] {
  if (tab === "all") return listCache
  return listCache.filter((e) => e.category === tab)
}

export function getInventoryListEntry(
  category: InventoryCategory,
  id: string
): InventoryListEntry | undefined {
  return listCache.find((e) => e.category === category && e.id === id)
}

export type InventoryDetail =
  | { category: "character"; meta: PurchaseMeta; data: CreatorCharacter }
  | { category: "persona"; meta: PurchaseMeta; data: CreatorPersona }
  | { category: "lorebook"; meta: PurchaseMeta; data: CreatorLorebook }
  | { category: "avatar"; meta: PurchaseMeta; data: CreatorAvatar }
  | { category: "background"; meta: PurchaseMeta; data: CreatorBackground }

export function getInventoryDetail(
  category: InventoryCategory,
  id: string
): InventoryDetail | null {
  const meta = purchaseMetaById[id]
  const allowed = purchasedIds[category] as readonly string[]
  if (!meta || !allowed.includes(id)) return null

  switch (category) {
    case "character": {
      const data = creatorCharacters.find((c) => c.id === id)
      return data ? { category, meta, data } : null
    }
    case "persona": {
      const data = creatorPersonas.find((c) => c.id === id)
      return data ? { category, meta, data } : null
    }
    case "lorebook": {
      const data = creatorLorebooks.find((c) => c.id === id)
      return data ? { category, meta, data } : null
    }
    case "avatar": {
      const data = creatorAvatars.find((c) => c.id === id)
      return data ? { category, meta, data } : null
    }
    case "background": {
      const data = creatorBackgrounds.find((c) => c.id === id)
      return data ? { category, meta, data } : null
    }
  }
}

export function getInventoryStaticParams(): { category: string; id: string }[] {
  return listCache.map((e) => ({ category: e.category, id: e.id }))
}
