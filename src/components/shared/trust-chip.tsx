import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type TrustChipProps = {
  icon: LucideIcon
  children: ReactNode
  iconClassName?: string
}

function TrustChip({ icon: Icon, children, iconClassName }: TrustChipProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon
        className={cn("size-4 shrink-0", iconClassName)}
        aria-hidden
      />
      <span>{children}</span>
    </div>
  )
}

export { TrustChip }
