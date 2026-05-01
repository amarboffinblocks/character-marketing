 "use client"

import { useEffect, useMemo, useState } from "react"
import type { AssetDistributionSlice } from "@/features/creator/workspace/components/asset-distribution-donut"
import { AssetDistributionDonut } from "@/features/creator/workspace/components/asset-distribution-donut"
import { AssetGrowthChart } from "@/features/creator/workspace/components/asset-growth-chart"
import { WorkspaceHero } from "@/features/creator/workspace/components/workspace-hero"
import type { WorkspaceKpi } from "@/features/creator/workspace/components/workspace-kpi-grid"
import { WorkspaceKpiGrid } from "@/features/creator/workspace/components/workspace-kpi-grid"
import { WorkspaceQuickCreate } from "@/features/creator/workspace/components/workspace-quick-create"
import type { WorkspaceRecentAsset } from "@/features/creator/workspace/components/workspace-recent-activity"
import { WorkspaceRecentActivity } from "@/features/creator/workspace/components/workspace-recent-activity"
import { WorkspaceSafetyCard } from "@/features/creator/workspace/components/workspace-safety-card"
import type { CreatorAvatar } from "@/features/creator/workspace/avatars/avatars-data"
import type { CreatorBackground } from "@/features/creator/workspace/backgrounds/backgrounds-data"
import type { CreatorCharacter } from "@/features/creator/workspace/characters/characters-data"
import type { CreatorLorebook } from "@/features/creator/workspace/lorebooks/lorebooks-data"
import type { CreatorPersona } from "@/features/creator/workspace/personas/personas-data"

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

function buildUnifiedAssets(params: {
  characters: CreatorCharacter[]
  personas: CreatorPersona[]
  lorebooks: CreatorLorebook[]
  avatars: CreatorAvatar[]
  backgrounds: CreatorBackground[]
}) {
  const characters: UnifiedAsset[] = params.characters.map((item) => ({
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

  const personas: UnifiedAsset[] = params.personas.map((item) => ({
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

  const lorebooks: UnifiedAsset[] = params.lorebooks.map((item) => ({
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

  const avatars: UnifiedAsset[] = params.avatars.map((item) => ({
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

  const backgrounds: UnifiedAsset[] = params.backgrounds.map((item) => ({
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
      dotColorClass: "bg-primary",
    },
    {
      label: "Personas",
      value: counts.persona,
      href: "/dashboard/creator/workspace/personas",
      colorClass: "text-emerald-500",
      dotColorClass: "bg-emerald-500",
    },
    {
      label: "Lorebooks",
      value: counts.lorebook,
      href: "/dashboard/creator/workspace/lorebooks",
      colorClass: "text-amber-500",
      dotColorClass: "bg-amber-500",
    },
    {
      label: "Avatars",
      value: counts.avatar,
      href: "/dashboard/creator/workspace/avatars",
      colorClass: "text-sky-500",
      dotColorClass: "bg-sky-500",
    },
    {
      label: "Backgrounds",
      value: counts.background,
      href: "/dashboard/creator/workspace/backgrounds",
      colorClass: "text-rose-500",
      dotColorClass: "bg-rose-500",
    },
  ]
}

export function WorkspaceHomeView() {
  const [characters, setCharacters] = useState<CreatorCharacter[]>([])
  const [personas, setPersonas] = useState<CreatorPersona[]>([])
  const [lorebooks, setLorebooks] = useState<CreatorLorebook[]>([])
  const [avatars, setAvatars] = useState<CreatorAvatar[]>([])
  const [backgrounds, setBackgrounds] = useState<CreatorBackground[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function loadWorkspaceData() {
      try {
        const [charactersRes, personasRes, lorebooksRes, avatarsRes, backgroundsRes] = await Promise.all([
          fetch("/api/creator/characters", { cache: "no-store" }),
          fetch("/api/creator/personas", { cache: "no-store" }),
          fetch("/api/creator/lorebooks", { cache: "no-store" }),
          fetch("/api/creator/avatars", { cache: "no-store" }),
          fetch("/api/creator/backgrounds", { cache: "no-store" }),
        ])

        const [charactersJson, personasJson, lorebooksJson, avatarsJson, backgroundsJson] = await Promise.all([
          charactersRes.ok ? (charactersRes.json() as Promise<{ items?: CreatorCharacter[] }>) : Promise.resolve({ items: [] }),
          personasRes.ok ? (personasRes.json() as Promise<{ items?: CreatorPersona[] }>) : Promise.resolve({ items: [] }),
          lorebooksRes.ok ? (lorebooksRes.json() as Promise<{ items?: CreatorLorebook[] }>) : Promise.resolve({ items: [] }),
          avatarsRes.ok ? (avatarsRes.json() as Promise<{ items?: CreatorAvatar[] }>) : Promise.resolve({ items: [] }),
          backgroundsRes.ok ? (backgroundsRes.json() as Promise<{ items?: CreatorBackground[] }>) : Promise.resolve({ items: [] }),
        ])

        if (!mounted) return
        setCharacters(charactersJson.items ?? [])
        setPersonas(personasJson.items ?? [])
        setLorebooks(lorebooksJson.items ?? [])
        setAvatars(avatarsJson.items ?? [])
        setBackgrounds(backgroundsJson.items ?? [])
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    void loadWorkspaceData()
    return () => {
      mounted = false
    }
  }, [])

  const assets = useMemo(
    () => buildUnifiedAssets({ characters, personas, lorebooks, avatars, backgrounds }),
    [avatars, backgrounds, characters, lorebooks, personas]
  )
  const totalAssets = assets.length

  const sfwAssets = assets.filter((asset) => asset.safety === "SFW").length
  const nsfwAssets = totalAssets - sfwAssets
  const sfwPercent = totalAssets === 0 ? 0 : Math.round((sfwAssets / totalAssets) * 100)

  const publishedCharacters = characters.filter((item) => item.status === "published").length
  const draftCharacters = characters.filter((item) => item.status === "draft").length
  const publishRate =
    characters.length === 0
      ? 0
      : Math.round((publishedCharacters / characters.length) * 100)

  const totalUsageReach =
    characters.reduce((acc, item) => acc + Number(item.usageCount ?? 0), 0) +
    personas.reduce((acc, item) => acc + Number(item.usageCount ?? 0), 0)

  const visibility = {
    public: assets.filter((asset) => asset.visibility === "public").length,
    private: assets.filter((asset) => asset.visibility === "private").length,
    unlisted: assets.filter((asset) => asset.visibility === "unlisted").length,
  }

  const completionChecks = [
    totalAssets > 0,
    personas.length > 0,
    lorebooks.length > 0,
    avatars.length > 0,
    backgrounds.length > 0,
    draftCharacters === 0,
    sfwPercent >= 70,
  ]
  const completionPercent = Math.round(
    (completionChecks.filter(Boolean).length / completionChecks.length) * 100
  )

  const donutSlices = buildDonutSlices(assets)
  const kpiItems = buildKpiItems(totalAssets, publishRate, sfwPercent, totalUsageReach, draftCharacters)
  const recentActivity = buildRecentActivity(assets)

  const growthSeries = [0, 0, 1, 1, 2, 2, 2, 3, 3, 4, 5, 5, 6, Math.max(totalAssets - 7, 6)].map(
    (value) => Math.min(value, totalAssets)
  )
  const totalAdded = growthSeries[growthSeries.length - 1]

  return (
    <div className="flex flex-col gap-6">
      <WorkspaceHero
        totalAssets={totalAssets}
        completionPercent={completionPercent}
        draftsPending={draftCharacters}
        missingPersonas={personas.length === 0}
      />

      <WorkspaceKpiGrid items={kpiItems} />

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          Loading workspace analytics...
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <AssetDistributionDonut slices={donutSlices} />
        <AssetGrowthChart
          series={growthSeries}
          totalAdded={totalAdded}
          period="last 14 days"
        />
      </section>

      <section className="grid gap-4">
        <WorkspaceSafetyCard sfw={sfwAssets} nsfw={nsfwAssets} visibility={visibility} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <WorkspaceRecentActivity items={recentActivity} />
        <WorkspaceQuickCreate />
      </section>
    </div>
  )
}
