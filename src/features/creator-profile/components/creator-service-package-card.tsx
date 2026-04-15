import { Check, Clock, PenLine, Sparkles } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PurchasePreselectDialog } from "@/features/creator-profile/components/purchase-preselect-dialog"
import type { CreatorServicePackage } from "@/features/creator-profile/model/creator-profile-types"
import { cn } from "@/lib/utils"

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

type CreatorServicePackageCardProps = {
  pkg: CreatorServicePackage
  creatorName: string
  className?: string
}

/**
 * Sidebar pricing card with delivery details and purchase CTAs.
 */
export function CreatorServicePackageCard({
  pkg,
  creatorName,
  className,
}: CreatorServicePackageCardProps) {
  const customHref = `mailto:support@character.market?subject=${encodeURIComponent(
    `Purchase Custom Package from ${creatorName}`
  )}`

  return (
    <Card
      className={cn(
        "border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-snug text-foreground">{pkg.title}</h3>
          <p className="text-lg font-semibold tabular-nums text-amber-600 dark:text-amber-400">
            {priceFormatter.format(pkg.price)}
          </p>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{pkg.description}</p>

        <div className="flex flex-col gap-2">
          <Badge variant="secondary" className="h-auto justify-start rounded-lg px-3 py-2 text-left font-normal">
            {pkg.scopeLabel}
          </Badge>
          <Badge variant="secondary" className="h-auto justify-start gap-1.5 rounded-lg px-3 py-2 text-left font-normal">
            <Sparkles className="size-3.5 shrink-0 text-primary" aria-hidden />
            {pkg.tokensLabel}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-4 border-y border-border/60 py-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4 shrink-0" aria-hidden />
            {pkg.deliveryDays} day{pkg.deliveryDays === 1 ? "" : "s"} delivery
          </span>
          <span className="inline-flex items-center gap-1.5">
            <PenLine className="size-4 shrink-0" aria-hidden />
            {pkg.revisionCount} revision{pkg.revisionCount === 1 ? "" : "s"}
          </span>
        </div>

        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
            {pkg.includedHeading}
          </p>
          <ul className="mt-3 space-y-2">
            {pkg.includedItems.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-500" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2 border-t border-border/60 pt-4">
          <PurchasePreselectDialog pkg={pkg} creatorName={creatorName} />
          <Link
            href={customHref}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 w-full")}
          >
            Purchase Custom
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
