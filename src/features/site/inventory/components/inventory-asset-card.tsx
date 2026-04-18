"use client"

import Link from "next/link"
import { ArrowUpRight, Package } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { InventoryCategory, InventoryListEntry } from "@/features/site/inventory/inventory-data"
import { cn } from "@/lib/utils"

const categoryLabel: Record<InventoryCategory, string> = {
  character: "Character",
  persona: "Persona",
  lorebook: "Lorebook",
  avatar: "Avatar",
  background: "Background",
}

type InventoryAssetCardProps = {
  item: InventoryListEntry
}

export function InventoryAssetCard({ item }: InventoryAssetCardProps) {
  const href = `/inventory/${item.category}/${item.id}`

  return (
    <article className="h-full">
      <Card
        className={cn(
          "group/card flex h-full flex-col gap-0 overflow-hidden py-0 transition-all duration-300",
          "hover:-translate-y-1 hover:shadow-lg"
        )}
      >
        <Link href={href} className="flex flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <div className="relative aspect-video overflow-hidden bg-muted">
            {item.thumbUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.thumbUrl}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/25 via-accent/35 to-primary/15">
                <Package className="size-10 text-primary/50" aria-hidden />
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/55 to-transparent opacity-80 transition-opacity group-hover/card:opacity-100" />

            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              <Badge variant="secondary" className="border-0 bg-emerald-600/90 text-[10px] text-white dark:bg-emerald-600/85">
                Owned
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {categoryLabel[item.category]}
              </Badge>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover/card:text-primary">
                  {item.title}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  From {item.sellerDisplayName}{" "}
                  <span className="text-muted-foreground/80">{item.sellerHandle}</span>
                </p>
              </div>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5" />
            </div>

            <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>

            <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
              <Badge
                variant="secondary"
                className={cn(
                  "h-5 text-[10px]",
                  item.safety === "NSFW"
                    ? "bg-destructive/15 text-destructive"
                    : "bg-primary/15 text-primary"
                )}
              >
                {item.safety}
              </Badge>
              {item.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="h-5 text-[10px]">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 2 ? (
                <Badge variant="outline" className="h-5 text-[10px]">
                  +{item.tags.length - 2}
                </Badge>
              ) : null}
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
              <span>Order {item.orderId}</span>
              <span>{item.purchasedAt}</span>
            </div>
          </div>
        </Link>
      </Card>
    </article>
  )
}
