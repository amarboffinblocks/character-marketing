import Link from "next/link"
import { AlertTriangle, ArrowUpRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type ActionItem = {
  id: string
  label: string
  meta: string
  href: string
  tone: "urgent" | "warning" | "info"
}

type ActionRequiredCardProps = {
  items: ActionItem[]
}

const toneClass: Record<ActionItem["tone"], string> = {
  urgent: "border-destructive/30 bg-destructive/5",
  warning: "border-amber-500/30 bg-amber-500/10",
  info: "border-primary/30 bg-primary/5",
}

const toneBadge: Record<ActionItem["tone"], string> = {
  urgent: "bg-destructive/15 text-destructive",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  info: "bg-primary/15 text-primary",
}

export function ActionRequiredCard({ items }: ActionRequiredCardProps) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-300" />
          <CardTitle>Action required</CardTitle>
        </div>
        <CardDescription>Top priority items to keep orders on track.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 py-4">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-4 text-sm text-muted-foreground">
            You are all caught up. Great work!
          </div>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/30",
                toneClass[item.tone]
              )}
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={cn("capitalize", toneBadge[item.tone])}>
                    {item.tone}
                  </Badge>
                  <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                </div>
                <p className="truncate text-xs text-muted-foreground">{item.meta}</p>
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}
