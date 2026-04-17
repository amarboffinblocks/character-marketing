import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type WorkspaceRecentAsset = {
  id: string
  title: string
  type: string
  updatedAt: string
  visibility: string
  safety: string
  href: string
  thumbnailUrl?: string
}

type WorkspaceRecentActivityProps = {
  items: WorkspaceRecentAsset[]
}

function initialsFromTitle(title: string) {
  return title
    .split(/\s+/)
    .map((part) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function WorkspaceRecentActivity({ items }: WorkspaceRecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent asset updates</CardTitle>
        <CardDescription>Most recent changes across workspace categories.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((asset) => (
          <Link
            key={asset.id}
            href={asset.href}
            className="flex items-center gap-3 rounded-lg border border-border/70 p-3 transition-colors hover:bg-accent/30"
          >
            {asset.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={asset.thumbnailUrl}
                alt={asset.title}
                className="size-10 shrink-0 rounded-md border border-border/60 object-cover"
              />
            ) : (
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-foreground">
                {initialsFromTitle(asset.title)}
              </span>
            )}
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-5 text-[10px]">
                  {asset.type}
                </Badge>
                <p className="truncate text-sm font-medium text-foreground">{asset.title}</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="capitalize">{asset.visibility}</span>
                <span>·</span>
                <span>{asset.safety}</span>
                <span>·</span>
                <span>Updated {asset.updatedAt}</span>
              </div>
            </div>
            <ArrowUpRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
