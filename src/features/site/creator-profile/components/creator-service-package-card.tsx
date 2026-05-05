import { Check, Clock, PenLine, Sparkles } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { CreatorServicePackage } from "@/features/site/creator-profile/types"
import { cn } from "@/lib/utils"

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

type CreatorServicePackageCardProps = {
  pkg: CreatorServicePackage
  creatorId: string
  creatorName: string
  className?: string
}

/**
 * Redesigned minimalist service package card.
 */
export function CreatorServicePackageCard({
  pkg,
  creatorId,
  creatorName,
  className,
}: CreatorServicePackageCardProps) {
  const preselectHref = `/creators/${creatorId}/purchase-preselect?packageId=${encodeURIComponent(pkg.id)}`

  return (
    <Card
      className={cn(
        "relative flex flex-col overflow-hidden border border-border/60 bg-card p-6 transition-all hover:shadow-lg hover:ring-1 hover:ring-primary/10",
        pkg.isRecommended && "ring-2 ring-primary/20 bg-linear-to-b from-card to-primary/[0.02]",
        className
      )}
    >
      {pkg.isRecommended && (
        <div className="absolute top-0 right-6 -translate-y-1/2">
          <Badge className="bg-foreground text-background hover:bg-foreground font-medium px-3 py-0.5 text-[10px] uppercase tracking-wider rounded-sm shadow-sm">
            Most popular
          </Badge>
        </div>
      )}

      <div className="space-y-1">
        <h3 className="text-sm font-bold uppercase tracking-tight text-muted-foreground/80">
          {pkg.title}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold tracking-tight text-foreground">
            {priceFormatter.format(pkg.price)}
          </span>
          <span className="text-xs text-muted-foreground font-medium">starting price</span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <Link
          href={preselectHref}
          className={cn(
            buttonVariants({ variant: pkg.isRecommended ? "default" : "outline", size: "lg" }),
            "w-full font-bold h-11 transition-all",
            !pkg.isRecommended && "hover:bg-foreground hover:text-background"
          )}
        >
          Get started
        </Link>

        <p className="text-[11px] text-center text-muted-foreground px-2 italic">
          {pkg.description || "Perfect for starting your project"}
        </p>
      </div>

      <div className="my-6 border-t border-border/50" />

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
            {pkg.includedHeading || "Features"}
          </p>
          <ul className="mt-4 space-y-3">
            {pkg.includedItems.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-foreground/90">
                <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-foreground/5 ring-1 ring-foreground/10">
                  <Check className="size-2.5 text-foreground" strokeWidth={3} />
                </div>
                <span className="leading-tight">{item}</span>
              </li>
            ))}
            {pkg.tokensLabel && (
              <li className="flex items-start gap-3 text-sm text-foreground/90">
                <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                  <Sparkles className="size-2.5 text-primary" strokeWidth={3} />
                </div>
                <span className="leading-tight font-medium text-primary">{pkg.tokensLabel}</span>
              </li>
            )}
          </ul>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Clock className="size-3.5" />
            {pkg.deliveryDays}d delivery
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <PenLine className="size-3.5" />
            {pkg.revisionCount} revisions
          </div>
        </div>
      </div>
    </Card>
  )
}
