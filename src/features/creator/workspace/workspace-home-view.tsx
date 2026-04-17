"use client"

import Link from "next/link"
import type { ComponentType } from "react"
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpenText,
  Brush,
  ImageIcon,
  MessageSquareText,
  Sparkles,
  UserSquare2,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { creatorBackgrounds } from "@/features/creator/workspace/backgrounds/backgrounds-data"
import { creatorCharacters } from "@/features/creator/workspace/characters/characters-data"
import { creatorLorebooks } from "@/features/creator/workspace/lorebooks/lorebooks-data"
import { creatorPersonas } from "@/features/creator/workspace/personas/personas-data"
import { creatorAvatars } from "@/features/creator/workspace/avatars/avatars-data"
import { cn } from "@/lib/utils"

type AssetCategory = {
  label: string
  total: number
  href: string
  icon: ComponentType<{ className?: string }>
}

type RecentAsset = {
  id: string
  title: string
  type: string
  updatedAt: string
  href: string
}

const assetCategories: AssetCategory[] = [
  {
    label: "Characters",
    total: creatorCharacters.length,
    href: "/dashboard/creator/workspace/characters",
    icon: Users,
  },
  {
    label: "Personas",
    total: creatorPersonas.length,
    href: "/dashboard/creator/workspace/personas",
    icon: MessageSquareText,
  },
  {
    label: "Lorebooks",
    total: creatorLorebooks.length,
    href: "/dashboard/creator/workspace/lorebooks",
    icon: BookOpenText,
  },
  {
    label: "Avatars",
    total: creatorAvatars.length,
    href: "/dashboard/creator/workspace/avatars",
    icon: UserSquare2,
  },
  {
    label: "Backgrounds",
    total: creatorBackgrounds.length,
    href: "/dashboard/creator/workspace/backgrounds",
    icon: ImageIcon,
  },
]

const recentAssets: RecentAsset[] = [
  ...creatorCharacters.map((character) => ({
    id: character.id,
    title: character.characterName,
    type: "Character",
    updatedAt: character.updatedAt,
    href: "/dashboard/creator/workspace/characters",
  })),
  ...creatorPersonas.map((persona) => ({
    id: persona.id,
    title: persona.personaName,
    type: "Persona",
    updatedAt: persona.updatedAt,
    href: "/dashboard/creator/workspace/personas",
  })),
  ...creatorLorebooks.map((lorebook) => ({
    id: lorebook.id,
    title: lorebook.lorebookName,
    type: "Lorebook",
    updatedAt: lorebook.updatedAt,
    href: "/dashboard/creator/workspace/lorebooks",
  })),
  ...creatorAvatars.map((avatar) => ({
    id: avatar.id,
    title: avatar.avatarName,
    type: "Avatar",
    updatedAt: avatar.updatedAt,
    href: "/dashboard/creator/workspace/avatars",
  })),
  ...creatorBackgrounds.map((background) => ({
    id: background.id,
    title: background.backgroundName,
    type: "Background",
    updatedAt: background.updatedAt,
    href: "/dashboard/creator/workspace/backgrounds",
  })),
].slice(0, 8)

function getPercent(value: number, total: number) {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

export function WorkspaceHomeView() {
  const totalAssets = assetCategories.reduce((acc, item) => acc + item.total, 0)
  const publishedCharacters = creatorCharacters.filter((item) => item.status === "published").length
  const draftCharacters = creatorCharacters.filter((item) => item.status === "draft").length
  const nsfwAssets =
    creatorCharacters.filter((item) => item.safety === "NSFW").length +
    creatorPersonas.filter((item) => item.safety === "NSFW").length +
    creatorLorebooks.filter((item) => item.safety === "NSFW").length +
    creatorAvatars.filter((item) => item.safety === "NSFW").length +
    creatorBackgrounds.filter((item) => item.safety === "NSFW").length
  const sfwAssets = totalAssets - nsfwAssets

  const visibilityTotals = {
    public:
      creatorCharacters.filter((item) => item.visibility === "public").length +
      creatorPersonas.filter((item) => item.visibility === "public").length +
      creatorLorebooks.filter((item) => item.visibility === "public").length +
      creatorAvatars.filter((item) => item.visibility === "public").length +
      creatorBackgrounds.filter((item) => item.visibility === "public").length,
    private:
      creatorCharacters.filter((item) => item.visibility === "private").length +
      creatorPersonas.filter((item) => item.visibility === "private").length +
      creatorLorebooks.filter((item) => item.visibility === "private").length +
      creatorAvatars.filter((item) => item.visibility === "private").length +
      creatorBackgrounds.filter((item) => item.visibility === "private").length,
    unlisted:
      creatorCharacters.filter((item) => item.visibility === "unlisted").length +
      creatorPersonas.filter((item) => item.visibility === "unlisted").length +
      creatorLorebooks.filter((item) => item.visibility === "unlisted").length +
      creatorAvatars.filter((item) => item.visibility === "unlisted").length +
      creatorBackgrounds.filter((item) => item.visibility === "unlisted").length,
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Workspace Dashboard
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Monitor all creator assets in one place, track quality health, and jump into quick create flows.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/creator/workspace/characters/new"
              className={cn(buttonVariants({ variant: "outline" }), "h-9")}
            >
              <Sparkles className="size-4" />
              New Character
            </Link>
            <Link href="/dashboard/creator/workspace/lorebooks/new" className={cn(buttonVariants(), "h-9")}>
              <Brush className="size-4" />
              New Lorebook
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Assets</CardDescription>
            <CardTitle className="text-2xl">{totalAssets}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Across 5 workspace categories</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Published Characters</CardDescription>
            <CardTitle className="text-2xl">{publishedCharacters}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Drafts pending: <span className="font-medium text-foreground">{draftCharacters}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Safety Coverage</CardDescription>
            <CardTitle className="text-2xl">{getPercent(sfwAssets, totalAssets)}% SFW</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            NSFW assets: <span className="font-medium text-foreground">{nsfwAssets}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Public Visibility</CardDescription>
            <CardTitle className="text-2xl">{getPercent(visibilityTotals.public, totalAssets)}%</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Public items: <span className="font-medium text-foreground">{visibilityTotals.public}</span>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Asset Mix</CardTitle>
            <CardDescription>Distribution by workspace category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {assetCategories.map((asset) => {
              const Icon = asset.icon
              const percentage = getPercent(asset.total, totalAssets)
              return (
                <Link
                  key={asset.label}
                  href={asset.href}
                  className="block rounded-lg border border-border/70 p-3 transition-colors hover:bg-accent/30"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Icon className="size-4 text-muted-foreground" />
                      {asset.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {asset.total} ({percentage}%)
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${percentage}%` }} />
                  </div>
                </Link>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Safety & Visibility</CardTitle>
            <CardDescription>Risk and publishing posture overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border/70 p-3">
              <p className="text-sm font-medium text-foreground">Safety Split</p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <Badge variant="secondary" className="bg-primary/15 text-primary">
                  SFW {sfwAssets}
                </Badge>
                <Badge variant="secondary" className="bg-destructive/15 text-destructive">
                  NSFW {nsfwAssets}
                </Badge>
              </div>
            </div>
            <div className="rounded-lg border border-border/70 p-3">
              <p className="text-sm font-medium text-foreground">Visibility Split</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">Public {visibilityTotals.public}</Badge>
                <Badge variant="outline">Private {visibilityTotals.private}</Badge>
                <Badge variant="outline">Unlisted {visibilityTotals.unlisted}</Badge>
              </div>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
              <p className="flex items-center gap-1.5 font-medium">
                <AlertTriangle className="size-3.5" />
                Quality reminder
              </p>
              <p className="mt-1">Review drafts and private assets weekly to keep your storefront portfolio fresh.</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Asset Updates</CardTitle>
            <CardDescription>Latest workspace changes across all categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentAssets.map((asset) => (
              <Link
                key={asset.id}
                href={asset.href}
                className="flex items-center justify-between rounded-lg border border-border/70 p-3 text-sm transition-colors hover:bg-accent/30"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{asset.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {asset.type} · Updated {asset.updatedAt}
                  </p>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Create</CardTitle>
            <CardDescription>Jump directly to asset creation pages</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/dashboard/creator/workspace/characters/new" className={cn(buttonVariants({ variant: "outline" }), "justify-start")}>
              New Character
            </Link>
            <Link href="/dashboard/creator/workspace/lorebooks/new" className={cn(buttonVariants({ variant: "outline" }), "justify-start")}>
              New Lorebook
            </Link>
            <Link href="/dashboard/creator/workspace/avatars/new" className={cn(buttonVariants({ variant: "outline" }), "justify-start")}>
              New Avatar
            </Link>
            <Link href="/dashboard/creator/workspace/backgrounds/new" className={cn(buttonVariants({ variant: "outline" }), "justify-start")}>
              New Background
            </Link>
            <Link href="/dashboard/creator/workspace/personas" className={cn(buttonVariants({ variant: "outline" }), "justify-start")}>
              Manage Personas
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
