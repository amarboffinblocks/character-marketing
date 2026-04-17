import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type SafetyVisibilityCardProps = {
  sfw: number
  nsfw: number
  visibility: {
    public: number
    private: number
    unlisted: number
  }
}

export function WorkspaceSafetyCard({ sfw, nsfw, visibility }: SafetyVisibilityCardProps) {
  const total = sfw + nsfw
  const sfwPercent = total === 0 ? 0 : Math.round((sfw / total) * 100)
  const nsfwPercent = total === 0 ? 0 : 100 - sfwPercent

  return (
    <Card>
      <CardHeader>
        <CardTitle>Safety & Visibility</CardTitle>
        <CardDescription>Marketplace posture across all assets.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-lg border border-border/70 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Safety split</span>
            <span className="font-medium text-foreground">{sfwPercent}% SFW</span>
          </div>
          <div className="flex h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-2 bg-primary"
              style={{ width: `${sfwPercent}%` }}
            />
            <div
              className="h-2 bg-destructive/70"
              style={{ width: `${nsfwPercent}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary" className="bg-primary/15 text-primary">
              SFW {sfw}
            </Badge>
            <Badge variant="secondary" className="bg-destructive/15 text-destructive">
              NSFW {nsfw}
            </Badge>
          </div>
        </div>

        <div className="rounded-lg border border-border/70 p-3">
          <p className="mb-2 text-sm font-medium text-foreground">Visibility</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { key: "public", label: "Public", value: visibility.public },
              { key: "private", label: "Private", value: visibility.private },
              { key: "unlisted", label: "Unlisted", value: visibility.unlisted },
            ].map((item) => (
              <Link
                key={item.key}
                href={`/dashboard/creator/workspace/characters`}
                className={cn(
                  "rounded-lg border border-border/70 bg-muted/20 p-2 text-center transition-colors hover:bg-accent/30"
                )}
              >
                <p className="text-[11px] text-muted-foreground">{item.label}</p>
                <p className="text-sm font-semibold text-foreground">{item.value}</p>
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
