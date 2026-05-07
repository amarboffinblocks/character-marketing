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
  size: "card" | "hero" | "avatar"
): string {
  const trimmed = workspaceUrl?.trim()
  if (trimmed) return trimmed

  const seed = `${category}-${id}`
  const [w, h] = size === "hero" ? ([1600, 600] as const) : size === "avatar" ? ([400, 400] as const) : ([800, 450] as const)
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`
}

export type InventoryDetail = {
  category: InventoryCategory
  meta: PurchaseMeta
  data: any // Keeping it generic as we are moving away from mock data
}

// These are now handled by the API, but keeping the stubs for type safety if needed elsewhere
export function getInventoryList(): InventoryListEntry[] {
  return []
}

export function getInventoryListFiltered(_tab: "all" | InventoryCategory): InventoryListEntry[] {
  return []
}

export function getInventoryListEntry(
  _category: InventoryCategory,
  _id: string
): InventoryListEntry | undefined {
  return undefined
}

export function getInventoryStaticParams(): { category: string; id: string }[] {
  return []
}

export function getInventoryDetail(
  _category: InventoryCategory,
  _id: string
): InventoryDetail | null {
  return null
}
