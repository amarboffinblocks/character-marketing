import { BookText } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { CreatorLorebook } from "@/features/creator/workspace/lorebooks/lorebooks-data"
import { cn } from "@/lib/utils"

type LorebookCardProps = {
  lorebook: CreatorLorebook
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function LorebookCard({ lorebook }: LorebookCardProps) {
  return (
    <li className="group rounded-xl border border-border/70 bg-card p-3 text-card-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-border hover:bg-accent/20">
      <div className="flex items-start gap-3">
        {lorebook.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={lorebook.avatarUrl}
            alt={lorebook.lorebookName}
            className="size-16 rounded-lg border border-border/60 object-cover"
          />
        ) : (
          <span className="inline-flex size-16 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-foreground">
            {initialsFromName(lorebook.lorebookName)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{lorebook.lorebookName}</p>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {lorebook.entries[0]?.context ?? "No entries yet"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary" className="h-5 text-[10px] capitalize">
          {lorebook.visibility}
        </Badge>
        <Badge
          variant="secondary"
          className={cn(
            "h-5 text-[10px]",
            lorebook.safety === "NSFW"
              ? "bg-destructive/15 text-destructive"
              : "bg-primary/15 text-primary"
          )}
        >
          {lorebook.safety}
        </Badge>
        {lorebook.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="outline" className="h-5 text-[10px]">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <BookText className="size-3" />
          {lorebook.entries.length} entries
        </span>
        <span>Updated {lorebook.updatedAt}</span>
      </div>
    </li>
  )
}
