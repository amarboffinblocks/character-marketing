import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"

type AdminPageHeroProps = {
  icon: LucideIcon
  badge: string
  title: string
  description: string
  /** Match creator dashboard SmartHero (stronger gradient, p-6). */
  tone?: "surface" | "studio"
  actions?: React.ReactNode
}

/**
 * Page header aligned with creator dashboard views: settings/earnings hero and SmartHero.
 */
export function AdminPageHero({
  icon: Icon,
  badge,
  title,
  description,
  tone = "surface",
  actions,
}: AdminPageHeroProps) {
  const sectionClass =
    tone === "studio"
      ? "relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-primary/15 via-accent/30 to-background p-6"
      : "rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6"

  const innerLayoutClass =
    tone === "studio"
      ? "flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
      : actions
        ? "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        : "flex flex-col gap-4"

  return (
    <section className={sectionClass}>
      <div className={innerLayoutClass}>
        <div className="flex items-center gap-4">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Icon className="size-5" />
          </span>
          <div className="space-y-1.5">
            <Badge variant="secondary" className="w-fit gap-1.5 font-normal">
              {badge}
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </section>
  )
}
