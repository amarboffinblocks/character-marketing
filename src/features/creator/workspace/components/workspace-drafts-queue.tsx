import Link from "next/link"
import { AlertCircle, ArrowUpRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type IncompleteAsset = {
  id: string
  title: string
  type: string
  reason: string
  href: string
}

type WorkspaceDraftsQueueProps = {
  items: IncompleteAsset[]
}

export function WorkspaceDraftsQueue({ items }: WorkspaceDraftsQueueProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-amber-600 dark:text-amber-300" />
            <CardTitle>Incomplete assets</CardTitle>
          </div>
          <CardDescription>Finish these to improve marketplace quality.</CardDescription>
        </div>
        <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-300">
          {items.length}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-4 text-sm text-muted-foreground">
            Your workspace is fully completed. Great job!
          </div>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center justify-between rounded-lg border border-border/70 p-3 transition-colors hover:bg-accent/30"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="h-5 text-[10px]">
                    {item.type}
                  </Badge>
                  <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                </div>
                <p className="truncate text-xs text-muted-foreground">{item.reason}</p>
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}
