import { Eye } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { CreatorCharacter } from "@/features/creator/workspace/characters/characters-data"
import { formatUsageCount } from "@/features/creator/workspace/characters/characters-data"
import { cn } from "@/lib/utils"

type CharacterCardProps = {
  character: CreatorCharacter
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <li className="group rounded-xl border border-border/70 bg-card p-3 text-card-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-border hover:bg-accent/20">
      <div className="flex items-start gap-3">
        {character.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={character.avatarUrl}
            alt={character.characterName}
            className="size-16 rounded-lg border border-border/60 object-cover"
          />
        ) : (
          <span className="inline-flex size-16 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-foreground">
            {initialsFromName(character.characterName)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{character.characterName}</p>
          <p className="truncate text-[11px] text-muted-foreground">By {character.handle}</p>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{character.description}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary" className="h-5 text-[10px] capitalize">
          {character.visibility}
        </Badge>
        <Badge
          variant="secondary"
          className={cn(
            "h-5 text-[10px]",
            character.safety === "NSFW"
              ? "bg-destructive/15 text-destructive"
              : "bg-primary/15 text-primary"
          )}
        >
          {character.safety}
        </Badge>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Eye className="size-3" />
          {formatUsageCount(character.usageCount)}
        </span>
        <span>Updated {character.updatedAt}</span>
      </div>
    </li>
  )
}
