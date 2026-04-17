import type { AssetDistributionSlice } from "@/features/creator/workspace/components/asset-distribution-donut"
import { AssetDistributionDonut } from "@/features/creator/workspace/components/asset-distribution-donut"
import { AssetGrowthChart } from "@/features/creator/workspace/components/asset-growth-chart"
import type { IncompleteAsset } from "@/features/creator/workspace/components/workspace-drafts-queue"
import { WorkspaceDraftsQueue } from "@/features/creator/workspace/components/workspace-drafts-queue"
import { WorkspaceHero } from "@/features/creator/workspace/components/workspace-hero"
import type { WorkspaceKpi } from "@/features/creator/workspace/components/workspace-kpi-grid"
import { WorkspaceKpiGrid } from "@/features/creator/workspace/components/workspace-kpi-grid"
import { WorkspaceQuickCreate } from "@/features/creator/workspace/components/workspace-quick-create"
import type { WorkspaceRecentAsset } from "@/features/creator/workspace/components/workspace-recent-activity"
import { WorkspaceRecentActivity } from "@/features/creator/workspace/components/workspace-recent-activity"
import { WorkspaceSafetyCard } from "@/features/creator/workspace/components/workspace-safety-card"
import { creatorAvatars } from "@/features/creator/workspace/avatars/avatars-data"
import { creatorBackgrounds } from "@/features/creator/workspace/backgrounds/backgrounds-data"
import { creatorCharacters } from "@/features/creator/workspace/characters/characters-data"
import { creatorLorebooks } from "@/features/creator/workspace/lorebooks/lorebooks-data"
import { creatorPersonas } from "@/features/creator/workspace/personas/personas-data"

type UnifiedAsset = {
  id: string
  title: string
  type: string
  category: "character" | "persona" | "lorebook" | "avatar" | "background"
  updatedAt: string
  visibility: string
  safety: string
  href: string
  thumbnailUrl?: string
  tagsCount: number
  hasDescription: boolean
  hasThumbnail: boolean
  isDraft?: boolean
}

function buildUnifiedAssets(): UnifiedAsset[] {
  const characters: UnifiedAsset[] = creatorCharacters.map((item) => ({
    id: item.id,
    title: item.characterName,
    type: "Character",
    category: "character",
    updatedAt: item.updatedAt,
    visibility: item.visibility,
    safety: item.safety,
    href: "/dashboard/creator/workspace/characters",
    thumbnailUrl: item.avatarUrl,
    tagsCount: item.tags.length,
    hasDescription: item.description.trim().length >= 40,
    hasThumbnail: Boolean(item.avatarUrl),
    isDraft: item.status === "draft",
  }))

  const personas: UnifiedAsset[] = creatorPersonas.map((item) => ({
    id: item.id,
    title: item.personaName,
    type: "Persona",
    category: "persona",
    updatedAt: item.updatedAt,
    visibility: item.visibility,
    safety: item.safety,
    href: "/dashboard/creator/workspace/personas",
    thumbnailUrl: item.avatarUrl,
    tagsCount: item.tags.length,
    hasDescription: item.personaDetails.trim().length >= 40,
    hasThumbnail: Boolean(item.avatarUrl),
  }))

  const lorebooks: UnifiedAsset[] = creatorLorebooks.map((item) => ({
    id: item.id,
    title: item.lorebookName,
    type: "Lorebook",
    category: "lorebook",
    updatedAt: item.updatedAt,
    visibility: item.visibility,
    safety: item.safety,
    href: "/dashboard/creator/workspace/lorebooks",
    thumbnailUrl: item.avatarUrl,
    tagsCount: item.tags.length,
    hasDescription: item.entries.length > 0,
    hasThumbnail: Boolean(item.avatarUrl),
  }))

  const avatars: UnifiedAsset[] = creatorAvatars.map((item) => ({
    id: item.id,
    title: item.avatarName,
    type: "Avatar",
    category: "avatar",
    updatedAt: item.updatedAt,
    visibility: item.visibility,
    safety: item.safety,
    href: "/dashboard/creator/workspace/avatars",
    thumbnailUrl: item.imageUrl,
    tagsCount: item.tags.length,
    hasDescription: item.notes.trim().length >= 20,
    hasThumbnail: Boolean(item.imageUrl),
  }))

  const backgrounds: UnifiedAsset[] = creatorBackgrounds.map((item) => ({
    id: item.id,
    title: item.backgroundName,
    type: "Background",
    category: "background",
    updatedAt: item.updatedAt,
    visibility: item.visibility,
    safety: item.safety,
    href: "/dashboard/creator/workspace/backgrounds",
    thumbnailUrl: item.imageUrl,
    tagsCount: item.tags.length,
    hasDescription: item.notes.trim().length >= 20,
    hasThumbnail: Boolean(item.imageUrl),
  }))

  return [...characters, ...personas, ...lorebooks, ...avatars, ...backgrounds]
}

function buildKpiItems(
  totalAssets: number,
  publishRate: number,
  sfwPercent: number,
  totalUsageReach: number,
  draftsCount: number
): WorkspaceKpi[] {
  return [
    {
      label: "Total Assets",
      value: String(totalAssets),
      hint: "All workspace items",
      href: "/dashboard/creator/workspace/characters",
      icon: "library",
    },
    {
      label: "Publish Rate",
      value: `${publishRate}%`,
      hint: "Published vs total",
      href: "/dashboard/creator/workspace/characters",
      icon: "publish",
    },
    {
      label: "SFW Coverage",
      value: `${sfwPercent}%`,
      hint: "Safety posture",
      href: "/dashboard/creator/workspace/characters",
      icon: "safety",
    },
    {
      label: "Usage Reach",
      value:
        totalUsageReach >= 1000
          ? `${(totalUsageReach / 1000).toFixed(1)}k`
          : String(totalUsageReach),
      hint: "Total impressions",
      href: "/dashboard/creator/workspace/characters",
      icon: "reach",
    },
    {
      label: "Drafts",
      value: String(draftsCount),
      hint: "Needs publishing",
      href: "/dashboard/creator/workspace/characters",
      icon: "drafts",
    },
  ]
}

function buildIncompleteQueue(assets: UnifiedAsset[]): IncompleteAsset[] {
  const items: IncompleteAsset[] = []

  for (const asset of assets) {
    if (asset.isDraft) {
      items.push({
        id: `${asset.id}-draft`,
        title: asset.title,
        type: asset.type,
        reason: "Draft — not yet published",
        href: asset.href,
      })
      continue
    }
    if (!asset.hasThumbnail) {
      items.push({
        id: `${asset.id}-thumb`,
        title: asset.title,
        type: asset.type,
        reason: "Missing thumbnail / avatar",
        href: asset.href,
      })
      continue
    }
    if (asset.tagsCount < 2) {
      items.push({
        id: `${asset.id}-tags`,
        title: asset.title,
        type: asset.type,
        reason: "Needs at least 2 tags",
        href: asset.href,
      })
      continue
    }
    if (!asset.hasDescription) {
      items.push({
        id: `${asset.id}-desc`,
        title: asset.title,
        type: asset.type,
        reason: "Description is too short",
        href: asset.href,
      })
    }
  }

  return items.slice(0, 5)
}

function buildRecentActivity(assets: UnifiedAsset[]): WorkspaceRecentAsset[] {
  return assets.slice(0, 6).map((asset) => ({
    id: asset.id,
    title: asset.title,
    type: asset.type,
    updatedAt: asset.updatedAt,
    visibility: asset.visibility,
    safety: asset.safety,
    href: asset.href,
    thumbnailUrl: asset.thumbnailUrl,
  }))
}

function buildDonutSlices(assets: UnifiedAsset[]): AssetDistributionSlice[] {
  const counts = assets.reduce<Record<UnifiedAsset["category"], number>>(
    (acc, asset) => {
      acc[asset.category] = (acc[asset.category] ?? 0) + 1
      return acc
    },
    { character: 0, persona: 0, lorebook: 0, avatar: 0, background: 0 }
  )

  return [
    {
      label: "Characters",
      value: counts.character,
      href: "/dashboard/creator/workspace/characters",
      colorClass: "text-primary",
    },
    {
      label: "Personas",
      value: counts.persona,
      href: "/dashboard/creator/workspace/personas",
      colorClass: "text-emerald-500",
    },
    {
      label: "Lorebooks",
      value: counts.lorebook,
      href: "/dashboard/creator/workspace/lorebooks",
      colorClass: "text-amber-500",
    },
    {
      label: "Avatars",
      value: counts.avatar,
      href: "/dashboard/creator/workspace/avatars",
      colorClass: "text-sky-500",
    },
    {
      label: "Backgrounds",
      value: counts.background,
      href: "/dashboard/creator/workspace/backgrounds",
      colorClass: "text-rose-500",
    },
  ]
}

export function WorkspaceHomeView() {
  const assets = buildUnifiedAssets()
  const totalAssets = assets.length

  const sfwAssets = assets.filter((asset) => asset.safety === "SFW").length
  const nsfwAssets = totalAssets - sfwAssets
  const sfwPercent = totalAssets === 0 ? 0 : Math.round((sfwAssets / totalAssets) * 100)

  const publishedCharacters = creatorCharacters.filter((item) => item.status === "published").length
  const draftCharacters = creatorCharacters.filter((item) => item.status === "draft").length
  const publishRate =
    creatorCharacters.length === 0
      ? 0
      : Math.round((publishedCharacters / creatorCharacters.length) * 100)

  const totalUsageReach =
    creatorCharacters.reduce((acc, item) => acc + item.usageCount, 0) +
    creatorPersonas.reduce((acc, item) => acc + item.usageCount, 0)

  const visibility = {
    public: assets.filter((asset) => asset.visibility === "public").length,
    private: assets.filter((asset) => asset.visibility === "private").length,
    unlisted: assets.filter((asset) => asset.visibility === "unlisted").length,
  }

  const completionChecks = [
    totalAssets > 0,
    creatorPersonas.length > 0,
    creatorLorebooks.length > 0,
    creatorAvatars.length > 0,
    creatorBackgrounds.length > 0,
    draftCharacters === 0,
    sfwPercent >= 70,
  ]
  const completionPercent = Math.round(
    (completionChecks.filter(Boolean).length / completionChecks.length) * 100
  )

  const donutSlices = buildDonutSlices(assets)
  const kpiItems = buildKpiItems(totalAssets, publishRate, sfwPercent, totalUsageReach, draftCharacters)
  const incompleteQueue = buildIncompleteQueue(assets)
  const recentActivity = buildRecentActivity(assets)

  const growthSeries = [0, 0, 1, 1, 2, 2, 2, 3, 3, 4, 5, 5, 6, Math.max(totalAssets - 7, 6)]
  const totalAdded = growthSeries[growthSeries.length - 1]

  return (
    <div className="flex flex-col gap-6">
      <WorkspaceHero
        totalAssets={totalAssets}
        completionPercent={completionPercent}
        draftsPending={draftCharacters}
        missingPersonas={creatorPersonas.length === 0}
      />

      <WorkspaceKpiGrid items={kpiItems} />

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <AssetDistributionDonut slices={donutSlices} />
        <AssetGrowthChart
          series={growthSeries}
          totalAdded={totalAdded}
          period="last 14 days"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <WorkspaceDraftsQueue items={incompleteQueue} />
        <WorkspaceSafetyCard sfw={sfwAssets} nsfw={nsfwAssets} visibility={visibility} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <WorkspaceRecentActivity items={recentActivity} />
        <WorkspaceQuickCreate />
      </section>
    </div>
  )
}
