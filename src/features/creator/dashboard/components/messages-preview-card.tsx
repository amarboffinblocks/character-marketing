import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type MessagePreviewItem = {
  id: string
  buyerName: string
  preview: string
  time: string
  unread: boolean
}

type MessagesPreviewCardProps = {
  items: MessagePreviewItem[]
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function MessagesPreviewCard({ items }: MessagesPreviewCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between border-b pb-4">
        <div>
          <CardTitle>Latest messages</CardTitle>
          <CardDescription>Buyer threads needing your attention.</CardDescription>
        </div>
        <Link
          href="/dashboard/creator/messages"
          className="text-xs font-medium text-primary hover:underline"
        >
          Open inbox
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href="/dashboard/creator/messages"
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/30"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  {initialsFromName(item.buyerName)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{item.buyerName}</p>
                    <span className="text-[11px] text-muted-foreground">{item.time}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{item.preview}</p>
                </div>
                {item.unread ? (
                  <Badge className="h-5 min-w-5 justify-center px-1.5">New</Badge>
                ) : (
                  <ArrowRight className="size-4 text-muted-foreground" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
