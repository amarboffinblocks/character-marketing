"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Eye } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CreatorCharacter } from "@/features/creator/workspace/characters/characters-data"
import { cn } from "@/lib/utils"

type CharacterReadViewProps = {
  entityId?: string
  apiPathPrefix?: string
  backHref?: string
  backLabel?: string
}

export function CharacterReadView({
  entityId,
  apiPathPrefix = "/api/creator/characters",
  backHref = "/dashboard/creator/workspace/characters",
  backLabel = "Back to Characters",
}: CharacterReadViewProps) {
  const searchParams = useSearchParams()
  const id = entityId ?? searchParams.get("id")?.trim() ?? ""
  const [item, setItem] = useState<CreatorCharacter | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      if (!id) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(entityId ? `${apiPathPrefix}/${id}` : `${apiPathPrefix}?id=${id}`)
        const payload = (await response.json()) as { item?: CreatorCharacter | null }
        if (!mounted) return
        setItem(payload.item ?? null)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    void load()
    return () => {
      mounted = false
    }
  }, [id])

  if (isLoading) return <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Loading character...</CardContent></Card>
  if (!item) return <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Character not found.</CardContent></Card>

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-card">
        <div className="relative h-44 overflow-hidden rounded-t-2xl bg-linear-to-br from-primary/20 via-accent/30 to-background sm:h-56">
          {item.backgroundUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.backgroundUrl} alt="Character background" className="h-full w-full object-cover" />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/60 via-background/10 to-background/10" />
          {/* <Link
            href={backHref}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "absolute left-4 top-4 z-20")}
          >
            <ArrowLeft className="size-3.5"  />
            {backLabel}
          </Link> */}
        </div>
        <div className="flex items-start gap-4 px-4 pb-5 pt-3 sm:px-6 sm:pb-6">
          <div className="shrink-0 z-50">
            {item.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.avatarUrl} alt={item.characterName} className="-mt-12 size-24 rounded-full border-4 border-card object-cover shadow-md sm:size-28" />
            ) : null}
          </div>
          <div className="min-w-0 space-y-2">
            <div className="flex items-end gap-2">

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{item.characterName}</h1> 
            <Badge variant="secondary" className="capitalize">{item.status}</Badge>
            </div>

            <div className="mt-1 flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="h-5 text-[10px] font-semibold text-primary/80">
                {tag}
              </Badge>
            ))}
          </div>

            <p className="max-w-4xl text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="capitalize">{item.visibility}</Badge>
              <Badge variant="secondary">{item.safety}</Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <Card className="xl:sticky xl:top-6 xl:h-max">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">How buyers see this</CardTitle>
                <CardDescription className="text-xs">Read-only preview card.</CardDescription>
              </div>
              <Badge variant="outline" className="h-5 text-[10px]">Preview</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 py-4">
            <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
              {item.backgroundUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.backgroundUrl} alt="" className="h-20 w-full object-cover" />
              ) : (
                <div className="h-20 w-full bg-linear-to-br from-primary/25 via-accent/30 to-primary/10" />
              )}
              <div className="relative -mt-8 px-4 pb-4">
                {item.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.avatarUrl} alt={item.characterName} className="size-14 rounded-full border-4 border-card object-cover" />
                ) : null}
                <p className="mt-2 truncate text-sm font-semibold">{item.characterName}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.tags.slice(0, 5).map((tag) => (
                    <Badge key={tag} variant="secondary" className="h-5 text-[10px] text-primary/80">{tag}</Badge>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="size-3" />
                    0
                  </span>
                  <span>{item.status}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle>Public identity</CardTitle>
              <CardDescription>Core information buyers see first.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 py-4 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <p className="text-xs font-medium text-foreground">Scenario</p>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{item.scenario}</p>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <p className="text-xs font-medium text-foreground">Personality Summary</p>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{item.personalitySummary}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle>Dialogue setup</CardTitle>
              <CardDescription>Opening lines and dialogue style.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 py-4">
              <div className="space-y-1.5"><p className="text-xs font-medium text-foreground">First Message</p><p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{item.firstMessage}</p></div>
              <div className="space-y-1.5"><p className="text-xs font-medium text-foreground">Alternative Messages</p><p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{item.alternativeMessages}</p></div>
              <div className="space-y-1.5"><p className="text-xs font-medium text-foreground">Example Dialogue</p><p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{item.exampleDialogue}</p></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle>Visibility, safety, and notes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 py-4 md:grid-cols-2">
              <div className="space-y-1.5"><p className="text-xs font-medium text-foreground">Author Notes</p><p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{item.authorNotes}</p></div>
              <div className="space-y-1.5"><p className="text-xs font-medium text-foreground">Character Notes</p><p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{item.characterNotes}</p></div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
