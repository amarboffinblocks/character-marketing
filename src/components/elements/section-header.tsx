import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type SectionHeaderProps = {
  /** Stable id for `aria-labelledby` on the parent `<section>`. */
  titleId: string
  title: string
  description?: string
  className?: string
  action?: ReactNode
}

function SectionHeader({
  titleId,
  title,
  description,
  className,
  action,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="space-y-2">
        <h2
          id={titleId}
          className="text-3xl font-bold tracking-tight sm:text-4xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-pretty text-muted-foreground sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export { SectionHeader }
export type { SectionHeaderProps }
