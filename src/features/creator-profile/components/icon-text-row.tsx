import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type IconTextRowProps = {
  icon: LucideIcon
  children: ReactNode
  className?: string
  iconClassName?: string
}

/**
 * Compact icon + label row for metadata (location, dates, etc.).
 */
export function IconTextRow({ icon: Icon, children, className, iconClassName }: IconTextRowProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <Icon className={cn("size-4 shrink-0 text-muted-foreground/90", iconClassName)} aria-hidden />
      <span className="text-foreground/90">{children}</span>
    </div>
  )
}
