import { Edit3, Share2, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { CreatorBackground } from "@/features/creator/workspace/backgrounds/backgrounds-data"
import { cn } from "@/lib/utils"

type BackgroundCardProps = {
  background: CreatorBackground
  onEdit: (id: string) => void
  onShare: (id: string) => void
  onDelete: (id: string) => void
}

export function BackgroundCard({ background, onEdit, onShare, onDelete }: BackgroundCardProps) {
  return (
    <li className="group rounded-xl border border-border/70 bg-card p-3 text-card-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-border hover:bg-accent/20">
      <div className="relative overflow-hidden rounded-lg border border-border/60 bg-muted">
        {background.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={background.imageUrl}
            alt={background.backgroundName}
            className="h-36 w-full object-cover"
          />
        ) : (
          <div className="flex h-36 w-full items-center justify-center bg-linear-to-br from-primary/20 via-accent/30 to-background">
            <span className="text-sm font-medium text-muted-foreground">No image</span>
          </div>
        )}
        <div className="absolute left-2 top-2 flex items-center gap-1.5">
          <Badge variant="secondary" className="h-5 bg-background/90 text-[10px] capitalize backdrop-blur-sm">
            {background.visibility}
          </Badge>
          <Badge
            variant="secondary"
            className={cn(
              "h-5 bg-background/90 text-[10px] backdrop-blur-sm",
              background.safety === "NSFW" ? "text-destructive" : "text-primary"
            )}
          >
            {background.safety}
          </Badge>
        </div>
      </div>

      <div className="mt-3 min-w-0">
        <p className="truncate text-sm font-semibold">{background.backgroundName}</p>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{background.notes}</p>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="capitalize">{background.type}</span>
        <span>Updated {background.updatedAt}</span>
      </div>
      <div className="mt-3 flex items-center gap-1.5 border-t border-border/60 pt-2">
        <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => onEdit(background.id)}>
          <Edit3 className="size-3.5" />
          Edit
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => onShare(background.id)}>
          <Share2 className="size-3.5" />
          Share
        </Button>
        <Button type="button" size="sm" variant="ghost" className="ml-auto h-7 px-2 text-xs text-destructive hover:text-destructive" onClick={() => onDelete(background.id)}>
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>
    </li>
  )
}
