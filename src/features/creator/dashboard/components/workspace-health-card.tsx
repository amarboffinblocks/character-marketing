import Link from "next/link"
import { BookOpenText, ImageIcon, MessageSquareText, UserSquare2, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type WorkspaceHealthItem = {
  label: string
  count: number
  href: string
  icon: "characters" | "personas" | "lorebooks" | "avatars" | "backgrounds"
  imageUrl?: string
}

const icons = {
  characters: Users,
  personas: MessageSquareText,
  lorebooks: BookOpenText,
  avatars: UserSquare2,
  backgrounds: ImageIcon,
} as const

type WorkspaceHealthCardProps = {
  items: WorkspaceHealthItem[]
}

export function WorkspaceHealthCard({ items }: WorkspaceHealthCardProps) {
  const total = items.reduce((acc, item) => acc + item.count, 0)

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Workspace health</CardTitle>
        <CardDescription>Your reusable creator assets across all categories.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 py-4 sm:grid-cols-2 xl:grid-cols-5">
        {items.map((item) => {
          const Icon = icons[item.icon]
          const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group rounded-xl border border-border/70 bg-card p-3 transition-colors hover:bg-accent/30"
              )}
            >
              {item.imageUrl ? (
                <div className="mb-3 overflow-hidden rounded-lg border border-border/70">
                  <img
                    src={item.imageUrl}
                    alt={`${item.label} preview`}
                    className="h-20 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ) : null}
              <div className="mb-2 flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">{item.label}</p>
              </div>
              <p className="text-2xl font-semibold tracking-tight text-foreground">{item.count}</p>
              <div className="mt-2 h-1.5 rounded-full bg-muted">
                <div className="h-1.5 rounded-full bg-primary" style={{ width: `${percentage}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{percentage}% of workspace</p>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
