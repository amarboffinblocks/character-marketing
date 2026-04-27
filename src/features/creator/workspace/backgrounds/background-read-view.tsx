"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, Frame } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CreatorBackground } from "@/features/creator/workspace/backgrounds/backgrounds-data"
import { cn } from "@/lib/utils"

type BackgroundReadViewProps = {
  entityId?: string
  apiPathPrefix?: string
  backHref?: string
  backLabel?: string
}

export function BackgroundReadView({
  entityId,
  apiPathPrefix = "/api/creator/backgrounds",
  backHref = "/dashboard/creator/workspace/backgrounds",
  backLabel = "Back to Backgrounds",
}: BackgroundReadViewProps) {
  const searchParams = useSearchParams()
  const id = entityId ?? searchParams.get("id")?.trim() ?? ""
  const [item, setItem] = useState<CreatorBackground | null>(null)
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
        const payload = (await response.json()) as { item?: CreatorBackground | null }
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

  if (isLoading) return <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Loading background...</CardContent></Card>
  if (!item) return <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Background not found.</CardContent></Card>

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-card">
        <div className="relative h-44 overflow-hidden rounded-t-2xl sm:h-56">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.backgroundName} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-primary/20 via-accent/30 to-background" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/60 via-background/10 to-background/10" />
          {/* <Link
            href={backHref}
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "absolute left-4 top-4 z-20"
            )}
          >
            <ArrowLeft className="size-3.5" />
            {backLabel}
          </Link> */}
        </div>
        <div className="flex flex-col gap-4 px-4 pb-4 pt-2 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:pb-6 sm:pt-3">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="max-w-[170px] truncate text-xl font-semibold tracking-tight sm:max-w-none sm:text-3xl">{item.backgroundName}</h2>
              <Badge variant="secondary" className="gap-1 bg-primary/15 text-primary">
                <CheckCircle2 className="size-3" />
                Background view
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {item.tags.slice(0, 8).map((tag) => (
                <Badge key={tag} variant="secondary" className="h-5 text-[10px] font-semibold text-primary/80">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.notes}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="h-5 text-[10px] capitalize">{item.visibility}</Badge>
              <Badge variant="secondary" className="h-5 text-[10px]">{item.safety}</Badge>
              <Badge variant="secondary" className="h-5 text-[10px] capitalize">{item.type}</Badge>
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
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt="" className="h-24 w-full object-cover" />
              ) : (
                <div className="h-24 w-full bg-linear-to-br from-primary/20 via-accent/30 to-background" />
              )}
              <div className="p-3">
                <p className="truncate text-sm font-semibold">{item.backgroundName}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.notes}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Frame className="size-3" />background</span>
                  <span>saved</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle>Background notes</CardTitle>
            </CardHeader>
            <CardContent className="py-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {item.notes}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
