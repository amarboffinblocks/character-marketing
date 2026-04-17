import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type DashboardHeaderMetaItem = {
  icon: React.ComponentType<{ className?: string }>
  label: string
}

export type DashboardHeaderProps = {
  /** Small label above the title (e.g. section name). */
  badge?: string
  /** Optional line above the main title (e.g. “Welcome back, Name”). */
  greeting?: string
  /** Main page heading. */
  title: ReactNode
  /** Supporting copy under the title. */
  description?: ReactNode
  /** Optional pill chips (availability, streaks, etc.). */
  meta?: DashboardHeaderMetaItem[]
  /** Primary / secondary actions (typically `Link` + `buttonVariants`). */
  actions?: ReactNode
  /** Right column: stats card, illustration, or custom content. */
  aside?: ReactNode
  /** Override outer section styles (radius, gradient). */
  className?: string
  /** Tighter hero for dense tool pages. */
  variant?: "default" | "compact"
  /**
   * `hero` — gradient shell (default).
   * `panel` — clean bordered card (Nexus-style admin pages).
   */
  surface?: "hero" | "panel"
}

/**
 * Premium dashboard hero for creator (and other) dashboard surfaces.
 * Keeps typography, spacing, and gradient shell consistent across pages.
 */
export function DashboardHeader({
  badge,
  greeting,
  title,
  description,
  meta,
  actions,
  aside,
  className,
  variant = "default",
  surface = "hero",
}: DashboardHeaderProps) {
  const isPanel = surface === "panel"

  return (
    <section
      className={cn(
        "overflow-hidden border shadow-sm",
        isPanel
          ? "rounded-2xl border-border/60 bg-card"
          : "bg-linear-to-br from-primary/12 via-background to-accent/20",
        !isPanel && variant === "default" && "rounded-[28px]",
        !isPanel && variant === "compact" && "rounded-3xl",
        className
      )}
    >
      <div
        className={cn(
          "relative flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between",
          isPanel ? "px-5 py-6 sm:px-6 sm:py-7" : "gap-8 px-6 py-8 lg:items-end lg:px-8"
        )}
      >
        <div className="max-w-3xl space-y-4">
          {badge ? (
            <Badge variant="secondary" className="w-fit border-0 bg-primary/12 text-primary">
              {badge}
            </Badge>
          ) : null}

          <div className="space-y-2">
            {greeting ? (
              <p className="text-sm font-medium text-muted-foreground">{greeting}</p>
            ) : null}
            <h1
              className={cn(
                "max-w-2xl font-semibold tracking-tight",
                isPanel ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
              )}
            >
              {title}
            </h1>
            {description ? (
              <div className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</div>
            ) : null}
          </div>

          {meta && meta.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {meta.map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.label}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
                      isPanel
                        ? "bg-muted/50 ring-1 ring-border/60"
                        : "bg-background/70 ring-1 ring-border/70"
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-primary" aria-hidden />
                    <span>{item.label}</span>
                  </div>
                )
              })}
            </div>
          ) : null}

          {actions ? <div className="flex flex-wrap gap-2 sm:gap-3">{actions}</div> : null}
        </div>

        {aside ? <div className="w-full max-w-md shrink-0 lg:max-w-sm">{aside}</div> : null}
      </div>
    </section>
  )
}
