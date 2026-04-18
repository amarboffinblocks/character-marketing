import Link from "next/link"
import { ArrowLeft, Package } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { CreatorAvatar } from "@/features/creator/workspace/avatars/avatars-data"
import type { CreatorBackground } from "@/features/creator/workspace/backgrounds/backgrounds-data"
import type { CreatorCharacter } from "@/features/creator/workspace/characters/characters-data"
import { formatUsageCount } from "@/features/creator/workspace/characters/characters-data"
import type { CreatorLorebook } from "@/features/creator/workspace/lorebooks/lorebooks-data"
import type { CreatorPersona } from "@/features/creator/workspace/personas/personas-data"
import { formatPersonaUsageCount } from "@/features/creator/workspace/personas/personas-data"
import type { InventoryCategory, InventoryDetail } from "@/features/site/inventory/inventory-data"
import { resolveInventoryImageUrl } from "@/features/site/inventory/inventory-data"
import { cn } from "@/lib/utils"

const categoryTitle: Record<InventoryCategory, string> = {
  character: "Character card",
  persona: "Persona",
  lorebook: "Lorebook",
  avatar: "Avatar",
  background: "Background",
}

type InventoryDetailViewProps = {
  detail: InventoryDetail
}

export function InventoryDetailView({ detail }: InventoryDetailViewProps) {
  const { meta } = detail

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/inventory"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5 -ml-2")}
        >
          <ArrowLeft className="size-4" />
          Back to inventory
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <DetailHero detail={detail} />

        <div className="space-y-4 px-5 pb-6 pt-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="bg-primary/15 text-primary">
              <Package className="mr-1 size-3" />
              Purchased {meta.purchasedAt}
            </Badge>
            <span>Order {meta.orderId}</span>
            <span>·</span>
            <span>
              Seller {meta.sellerDisplayName} {meta.sellerHandle}
            </span>
          </div>

          {detail.category === "character" ? <CharacterDetail data={detail.data} /> : null}
          {detail.category === "persona" ? <PersonaDetail data={detail.data} /> : null}
          {detail.category === "lorebook" ? <LorebookDetail data={detail.data} /> : null}
          {detail.category === "avatar" ? <AvatarDetail data={detail.data} /> : null}
          {detail.category === "background" ? <BackgroundDetail data={detail.data} /> : null}
        </div>
      </div>
    </div>
  )
}

function workspaceImageFromDetail(detail: InventoryDetail): string | undefined {
  switch (detail.category) {
    case "character":
    case "persona":
    case "lorebook":
      return detail.data.avatarUrl?.trim() || undefined
    case "avatar":
    case "background":
      return detail.data.imageUrl?.trim() || undefined
  }
}

function DetailHero({ detail }: { detail: InventoryDetail }) {
  const label = categoryTitle[detail.category]

  const title =
    detail.category === "character"
      ? detail.data.characterName
      : detail.category === "persona"
        ? detail.data.personaName
        : detail.category === "lorebook"
          ? detail.data.lorebookName
          : detail.category === "avatar"
            ? detail.data.avatarName
            : detail.data.backgroundName

  const heroSrc = resolveInventoryImageUrl(
    detail.data.id,
    detail.category,
    workspaceImageFromDetail(detail),
    "hero"
  )

  return (
    <div className="relative border-b border-border/70">
      <div className="relative aspect-[21/9] w-full overflow-hidden bg-muted sm:aspect-[3/1]">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote Picsum placeholder */}
        <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent" />
      </div>
      <div className="relative -mt-10 flex flex-col gap-2 px-5 pb-5 sm:-mt-12 sm:px-6 sm:pb-6">
        <Badge variant="secondary" className="w-fit text-[10px]">
          {label}
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
      </div>
    </div>
  )
}

function FieldBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="whitespace-pre-wrap text-sm text-foreground">{value}</p>
    </div>
  )
}

function CharacterDetail({ data }: { data: CreatorCharacter }) {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base">Public identity</CardTitle>
          <CardDescription>Aligned with creator workspace character builder.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 py-4 md:grid-cols-2">
          <FieldBlock label="Handle" value={data.handle} />
          <FieldBlock label="Visibility" value={data.visibility} />
          <FieldBlock label="Safety" value={data.safety} />
          <FieldBlock label="Status" value={data.status} />
          <div className="md:col-span-2">
            <FieldBlock label="Description" value={data.description} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base">Roleplay setup</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 py-4">
          <FieldBlock label="Scenario" value={data.scenario} />
          <FieldBlock label="Personality" value={data.personalitySummary} />
          <Separator />
          <FieldBlock label="First message" value={data.firstMessage} />
          <FieldBlock label="Alternative messages" value={data.alternativeMessages} />
          <FieldBlock label="Example dialogue" value={data.exampleDialogue} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base">Tags & creator notes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 py-4">
          <div className="flex flex-wrap gap-1.5">
            {data.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <FieldBlock label="Author notes" value={data.authorNotes} />
          <FieldBlock label="Character notes" value={data.characterNotes} />
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span>Updated {data.updatedAt}</span>
            <span>Usage {formatUsageCount(data.usageCount)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PersonaDetail({ data }: { data: CreatorPersona }) {
  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-base">Persona details</CardTitle>
        <CardDescription>Voice and tone from the creator workspace.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 py-4">
        <div className="flex flex-wrap gap-1.5">
          {data.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <FieldBlock label="Details" value={data.personaDetails} />
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>Visibility {data.visibility}</span>
          <span>Safety {data.safety}</span>
          <span>Updated {data.updatedAt}</span>
          <span>Usage {formatPersonaUsageCount(data.usageCount)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function LorebookDetail({ data }: { data: CreatorLorebook }) {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base">Lorebook</CardTitle>
          <CardDescription>{data.entries.length} entries included with your purchase.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5 py-4">
          {data.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base">Entries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 py-4">
          {data.entries.map((entry) => (
            <div key={entry.id} className="rounded-lg border border-border/70 bg-muted/20 p-3">
              <p className="text-xs font-medium text-muted-foreground">Keywords</p>
              <p className="text-sm text-foreground">{entry.keywords}</p>
              <Separator className="my-2" />
              <p className="text-xs font-medium text-muted-foreground">Context</p>
              <p className="text-sm text-foreground">{entry.context}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function AvatarDetail({ data }: { data: CreatorAvatar }) {
  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-base">Avatar asset</CardTitle>
        <CardDescription>Portrait pack from the creator workspace.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 py-4">
        <div className="flex flex-wrap gap-1.5">
          {data.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <FieldBlock label="Notes" value={data.notes} />
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>Style {data.style}</span>
          <span>Visibility {data.visibility}</span>
          <span>Safety {data.safety}</span>
          <span>Updated {data.updatedAt}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function BackgroundDetail({ data }: { data: CreatorBackground }) {
  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-base">Background asset</CardTitle>
        <CardDescription>Scene pack from the creator workspace.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 py-4">
        <div className="flex flex-wrap gap-1.5">
          {data.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <FieldBlock label="Notes" value={data.notes} />
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>Type {data.type}</span>
          <span>Visibility {data.visibility}</span>
          <span>Safety {data.safety}</span>
          <span>Updated {data.updatedAt}</span>
        </div>
      </CardContent>
    </Card>
  )
}
