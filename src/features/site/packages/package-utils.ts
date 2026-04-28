import type { CreatorServicePackage } from "@/features/site/creator-profile/types"

export const CUSTOM_PACKAGE_FEATURES = [
  { label: "Persona", keywords: ["persona"] },
  { label: "Lorebook", keywords: ["lorebook", "lore"] },
  { label: "Background", keywords: ["background"] },
  { label: "Avatar", keywords: ["avatar"] },
  { label: "Character", keywords: ["character"] },
] as const

export const DUMMY_CUSTOM_PACKAGES: CreatorServicePackage[] = [
  {
    id: "dummy-custom-starter",
    title: "Custom Story Starter",
    price: 79,
    description: "Great for quick character deployment with core story and visual setup.",
    scopeLabel: "Scope: Focused starter custom package",
    tokensLabel: "Up to 4K context tokens",
    deliveryDays: 4,
    revisionCount: 1,
    includedHeading: "WHAT'S INCLUDED",
    includedItems: [
      "1 persona setup and tone calibration",
      "1 lorebook essentials with key world rules",
      "1 styled background prompt direction",
      "1 avatar style and expression guidance",
      "1 character voice and behavior framework",
    ],
  },
  {
    id: "dummy-custom-pro",
    title: "Custom Worldbuilder Pro",
    price: 149,
    description: "Best for creators who need deeper lore, consistency, and premium polish.",
    scopeLabel: "Scope: Deep worldbuilding and premium polish",
    tokensLabel: "Up to 12K context tokens",
    deliveryDays: 7,
    revisionCount: 2,
    includedHeading: "WHAT'S INCLUDED",
    includedItems: [
      "2 advanced persona profiles with relationship logic",
      "2 expanded lorebook sets with factions and timeline",
      "2 cinematic background concept packs",
      "2 premium avatar art direction sets",
      "2 character archetype and progression layers",
    ],
  },
]

export type CustomAssetType = "character" | "persona" | "lorebook" | "avatar" | "background"

const FEATURE_KEYWORDS_BY_ASSET: Record<CustomAssetType, readonly string[]> = {
  character: ["character"],
  persona: ["persona"],
  lorebook: ["lorebook", "lore"],
  avatar: ["avatar"],
  background: ["background"],
}

export function isFeatureIncluded(items: readonly string[], keywords: readonly string[]) {
  const normalizedItems = items.map((item) => item.toLowerCase())
  return keywords.some((keyword) => normalizedItems.some((item) => item.includes(keyword)))
}

export function getFeatureCount(items: readonly string[], keywords: readonly string[]) {
  const matchingItems = items.filter((item) =>
    keywords.some((keyword) => item.toLowerCase().includes(keyword))
  )

  if (matchingItems.length === 0) {
    return 0
  }

  const explicitCount = matchingItems.reduce((count, item) => {
    const match = item.match(/\b(\d+)\b/)
    return count + (match ? Number(match[1]) : 0)
  }, 0)

  return explicitCount > 0 ? explicitCount : matchingItems.length
}

export function getCustomPackages(
  packages: readonly CreatorServicePackage[],
  options?: { includeFallback?: boolean }
) {
  const customPackages = packages.slice(1)
  const includeFallback = options?.includeFallback ?? true
  if (customPackages.length > 0) return customPackages
  return includeFallback ? DUMMY_CUSTOM_PACKAGES : []
}

export function getPackageAssetLimits(pkg: CreatorServicePackage): Record<CustomAssetType, number> {
  return {
    character: getFeatureCount(pkg.includedItems, FEATURE_KEYWORDS_BY_ASSET.character),
    persona: getFeatureCount(pkg.includedItems, FEATURE_KEYWORDS_BY_ASSET.persona),
    lorebook: getFeatureCount(pkg.includedItems, FEATURE_KEYWORDS_BY_ASSET.lorebook),
    avatar: getFeatureCount(pkg.includedItems, FEATURE_KEYWORDS_BY_ASSET.avatar),
    background: getFeatureCount(pkg.includedItems, FEATURE_KEYWORDS_BY_ASSET.background),
  }
}
