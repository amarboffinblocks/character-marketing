"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, ImageIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CreatorAvatar } from "@/features/creator/workspace/avatars/avatars-data"
import { cn } from "@/lib/utils"

type AvatarReadViewProps = {
  entityId?: string
  apiPathPrefix?: string
  backHref?: string
  backLabel?: string
}

export function AvatarReadView({
  entityId,
  apiPathPrefix = "/api/creator/avatars",
  backHref = "/dashboard/creator/workspace/avatars",
  backLabel = "Back to Avatars",
}: AvatarReadViewProps) {
  const searchParams = useSearchParams()
  const id = entityId ?? searchParams.get("id")?.trim() ?? ""
  const [item, setItem] = useState<CreatorAvatar | null>(null)
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
        const payload = (await response.json()) as { item?: CreatorAvatar | null }
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

  if (isLoading) return <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Loading avatar...</CardContent></Card>
  if (!item) return <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Avatar not found.</CardContent></Card>

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-card">
        <div className="relative h-40 overflow-hidden rounded-t-2xl bg-linear-to-br from-primary/20 via-accent/30 to-background sm:h-52">
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
          <div className="flex min-w-0 gap-3 sm:gap-4">
            <div className="relative z-10 -mt-12 shrink-0 self-start">
              <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-muted shadow-md ring-2 ring-background sm:size-28">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.avatarName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl font-semibold text-primary">{(item.avatarName.trim().slice(0, 2) || "AV").toUpperCase()}</span>
                )}
              </div>
            </div>
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="max-w-[170px] truncate text-xl font-semibold tracking-tight sm:max-w-none sm:text-3xl">{item.avatarName}</h2>
                <Badge variant="secondary" className="gap-1 bg-primary/15 text-primary">
                  <CheckCircle2 className="size-3" />
                  Avatar view
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
                <Badge variant="secondary" className="h-5 text-[10px] capitalize">{item.style}</Badge>
              </div>
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
            <div className="overflow-hidden rounded-xl border border-border/70 bg-card p-3">
              <div className="flex items-start gap-3">
                <div className="inline-flex size-14 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.avatarName}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.notes}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {item.tags.slice(0, 5).map((tag) => (
                  <Badge key={tag} variant="secondary" className="h-5 text-[10px] text-primary/80">{tag}</Badge>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><ImageIcon className="size-3" />avatar</span>
                <span>saved</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle>Avatar details</CardTitle>
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
