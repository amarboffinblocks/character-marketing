"use client"

import Link from "next/link"
import { useState } from "react"
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  FileText, 
  Image as ImageIcon, 
  Package,
  ShieldCheck
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SectionTabs, type SectionTabItem } from "@/features/creator/shared/section-tabs"
import { formatUsageCount } from "@/features/creator/workspace/characters/characters-data"
import { formatPersonaUsageCount } from "@/features/creator/workspace/personas/personas-data"
import type { InventoryCategory, InventoryDetail } from "@/features/site/inventory/inventory-data"
import { resolveInventoryImageUrl } from "@/features/site/inventory/inventory-data"
import { cn } from "@/lib/utils"

type InventoryTab = "identity" | "dialogue" | "meta"

const inventoryTabs: SectionTabItem<InventoryTab>[] = [
  { value: "identity", label: "Basic info", icon: ImageIcon },
  { value: "dialogue", label: "Dialogue", icon: FileText },
  { value: "meta", label: "Notes & visibility", icon: Eye },
]

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
  const [tab, setTab] = useState<InventoryTab>("identity")

  const exportAsJson = () => {
    const dataStr = JSON.stringify(detail.data, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${detail.category}_${detail.data.id}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

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

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <DetailHero detail={detail} onExport={exportAsJson} />

        <div className="px-5 pb-6 pt-4 sm:px-6">
          <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
            {/* Left side: Preview */}
            <aside className="space-y-4">
              <Card>
                <CardHeader className="border-b pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">In-app preview</CardTitle>
                      <CardDescription className="text-xs">How this appears in the marketplace.</CardDescription>
                    </div>
                    <Badge variant="outline" className="h-5 text-[10px]">
                      Preview
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-4">
                   <div className="overflow-hidden rounded-xl border border-border/70 bg-muted/10">
                    <DetailPreviewCard detail={detail} />
                   </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2 rounded-xl border border-primary/10 bg-primary/5 p-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 text-primary font-medium mb-1">
                  <ShieldCheck className="size-3.5" />
                  Ownership Verified
                </div>
                <p>Purchased on {detail.meta.purchasedAt}</p>
                <p>Order #{detail.meta.orderId}</p>
                <p>Creator: {detail.meta.sellerDisplayName}</p>
              </div>
            </aside>

            {/* Right side: Tabs & Details */}
            <div className="space-y-4">
              {detail.category === "character" ? (
                <>
                  <SectionTabs value={tab} onChange={setTab} items={inventoryTabs} />
                  {tab === "identity" && <CharacterIdentity data={detail.data} />}
                  {tab === "dialogue" && <CharacterDialogue data={detail.data} />}
                  {tab === "meta" && <CharacterMeta data={detail.data} />}
                </>
              ) : (
                <div className="space-y-6">
                   {detail.category === "persona" ? <PersonaDetail data={detail.data} /> : null}
                   {detail.category === "lorebook" ? <LorebookDetail data={detail.data} /> : null}
                   {detail.category === "avatar" ? <AvatarDetail data={detail.data} /> : null}
                   {detail.category === "background" ? <BackgroundDetail data={detail.data} /> : null}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function DetailHero({ detail, onExport }: { detail: InventoryDetail; onExport: () => void }) {
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
    detail.data.backgroundUrl || detail.data.imageUrl,
    "hero"
  )

  const avatarSrc = resolveInventoryImageUrl(
    detail.data.id,
    detail.category,
    detail.data.avatarUrl || detail.data.imageUrl,
    "avatar"
  )

  return (
    <div className="relative">
      <div className="relative aspect-[21/9] w-full overflow-hidden bg-muted sm:aspect-[4/1]">
        <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent" />
        
        <Button 
          variant="secondary" 
          size="sm" 
          className="absolute right-4 top-4 gap-1.5 backdrop-blur-md bg-background/60 hover:bg-background/80"
          onClick={onExport}
        >
          <Download className="size-3.5" />
          Export as JSON v2
        </Button>
      </div>

      <div className="relative flex px-5 pb-4 sm:px-6">
        <div className="flex w-full gap-4">
          <div className="relative z-10 -mt-10 shrink-0 sm:-mt-12">
            <img 
              src={avatarSrc} 
              alt={title} 
              className="size-20 rounded-full border-4 border-card bg-muted object-cover shadow-md sm:size-28" 
            />
          </div>
          <div className="min-w-0 pt-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {title}
              </h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] h-5">
                {label}
              </Badge>
            </div>
            {detail.category === "character" && (
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                {detail.data.description}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
              <Badge variant="outline" className="h-4 px-1.5 uppercase">{detail.data.visibility || "Purchased"}</Badge>
              <Badge variant="outline" className="h-4 px-1.5">{detail.data.safety || "SFW"}</Badge>
              {detail.category === "character" && <span>{formatUsageCount(detail.data.usageCount || 0)} used</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailPreviewCard({ detail }: { detail: InventoryDetail }) {
  const avatarSrc = resolveInventoryImageUrl(detail.data.id, detail.category, detail.data.avatarUrl || detail.data.imageUrl, "avatar")
  const bannerSrc = resolveInventoryImageUrl(detail.data.id, detail.category, detail.data.backgroundUrl || detail.data.imageUrl, "hero")
  
  return (
    <div className="p-3">
      <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-xs">
        <img src={bannerSrc} alt="" className="h-16 w-full object-cover" />
        <div className="relative -mt-6 px-3 pb-3">
          <img src={avatarSrc} alt="" className="size-12 rounded-full border-2 border-card bg-muted object-cover" />
          <p className="mt-2 text-sm font-bold truncate">{detail.data.characterName || detail.data.personaName || detail.data.lorebookName || "Asset"}</p>
          <div className="mt-1 flex flex-wrap gap-1">
             {detail.data.tags?.slice(0, 3).map((tag: string) => (
               <Badge key={tag} variant="secondary" className="h-4 px-1 text-[8px]">{tag}</Badge>
             ))}
          </div>
          <p className="mt-2 line-clamp-2 text-[10px] text-muted-foreground">
            {detail.data.description || detail.data.personaDetails || "Verified asset."}
          </p>
        </div>
      </div>
    </div>
  )
}

function ReadOnlyField({ label, value, className }: { label: string; value?: string; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 text-sm text-foreground whitespace-pre-wrap min-h-[40px]">
        {value || <span className="italic text-muted-foreground/50">Not provided</span>}
      </div>
    </div>
  )
}

function CharacterIdentity({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-base font-semibold">Public Identity</CardTitle>
        <CardDescription>Core details visible in the platform.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 py-4 sm:grid-cols-2">
        <ReadOnlyField label="Character Name" value={data.characterName} />
        <ReadOnlyField label="Status" value={data.status || "Published"} />
        <ReadOnlyField label="Description" value={data.description} className="sm:col-span-2" />
        <ReadOnlyField label="Scenario" value={data.scenario} className="sm:col-span-2" />
        <ReadOnlyField label="Personality Summary" value={data.personalitySummary} className="sm:col-span-2" />
      </CardContent>
    </Card>
  )
}

function CharacterDialogue({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-base font-semibold">Dialogue Setup</CardTitle>
        <CardDescription>AI behavior and response patterns.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 py-4">
        <ReadOnlyField label="First Message" value={data.firstMessage} />
        <ReadOnlyField label="Alternative Messages" value={data.alternativeMessages} />
        <ReadOnlyField label="Example Dialogue" value={data.exampleDialogue} />
      </CardContent>
    </Card>
  )
}

function CharacterMeta({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-base font-semibold">Notes & Metadata</CardTitle>
        <CardDescription>Additional information and creator tags.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 py-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tags</label>
          <div className="flex flex-wrap gap-1.5 pt-1">
             {data.tags?.map((tag: string) => (
               <Badge key={tag} variant="secondary" className="rounded-full px-2.5 h-6 text-xs">{tag}</Badge>
             ))}
          </div>
        </div>
        <ReadOnlyField label="Author Notes" value={data.authorNotes} />
        <ReadOnlyField label="Character Notes" value={data.characterNotes} />
        <div className="flex gap-4 text-[10px] font-medium text-muted-foreground">
          <span>VISIBILITY: {data.visibility}</span>
          <span>SAFETY: {data.safety}</span>
          <span>UPDATED: {data.updatedAt}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function PersonaDetail({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Persona Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 py-4">
        <ReadOnlyField label="Persona Name" value={data.personaName} />
        <ReadOnlyField label="Details" value={data.personaDetails} />
        <div className="flex flex-wrap gap-1.5">
           {data.tags?.map((tag: string) => (
             <Badge key={tag} variant="secondary">{tag}</Badge>
           ))}
        </div>
      </CardContent>
    </Card>
  )
}

function LorebookDetail({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle>Lorebook: {data.lorebookName}</CardTitle>
          <CardDescription>{data.entries?.length || 0} entries included.</CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          <ReadOnlyField label="Description" value={data.description} />
        </CardContent>
      </Card>
      {data.entries?.map((entry: any, idx: number) => (
        <Card key={idx}>
          <CardHeader className="py-3 px-4 bg-muted/10">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary/70">Entry #{idx + 1}</CardTitle>
          </CardHeader>
          <CardContent className="py-4 space-y-3">
             <ReadOnlyField label="Keywords" value={entry.keywords} />
             <ReadOnlyField label="Context" value={entry.context} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function AvatarDetail({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Avatar Asset</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 py-4">
        <ReadOnlyField label="Avatar Name" value={data.avatarName} />
        <ReadOnlyField label="Notes" value={data.notes} />
        <ReadOnlyField label="Style" value={data.style} />
      </CardContent>
    </Card>
  )
}

function BackgroundDetail({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Background Asset</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 py-4">
        <ReadOnlyField label="Background Name" value={data.backgroundName} />
        <ReadOnlyField label="Notes" value={data.notes} />
        <ReadOnlyField label="Type" value={data.type} />
      </CardContent>
    </Card>
  )
}
