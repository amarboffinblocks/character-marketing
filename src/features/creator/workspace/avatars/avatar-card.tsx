import { Edit3, ImageIcon, Share2, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { CreatorAvatar } from "@/features/creator/workspace/avatars/avatars-data"
import { cn } from "@/lib/utils"

type AvatarCardProps = {
  avatar: CreatorAvatar
  onEdit: (id: string) => void
  onShare: (id: string) => void
  onDelete: (id: string) => void
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function AvatarCard({ avatar, onEdit, onShare, onDelete }: AvatarCardProps) {
  return (
    <li className="group rounded-xl border border-border/70 bg-card p-3 text-card-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-border hover:bg-accent/20">
      <div className="flex items-start gap-3">
        {avatar.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar.imageUrl}
            alt={avatar.avatarName}
            className="size-16 rounded-lg border border-border/60 object-cover"
          />
        ) : (
          <span className="inline-flex size-16 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-foreground">
            {initialsFromName(avatar.avatarName)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{avatar.avatarName}</p>
          <p className="truncate text-[11px] text-muted-foreground capitalize">{avatar.style}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {avatar.tags.slice(0, 5).map((tag) => (
              <Badge key={tag} variant="secondary" className="h-5 text-[10px] font-semibold text-primary/80">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{avatar.notes}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary" className="h-5 text-[10px] capitalize">
          {avatar.visibility}
        </Badge>
        <Badge
          variant="secondary"
          className={cn(
            "h-5 text-[10px]",
            avatar.safety === "NSFW"
              ? "bg-destructive/15 text-destructive"
              : "bg-primary/15 text-primary"
          )}
        >
          {avatar.safety}
        </Badge>
       
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <ImageIcon className="size-3" />
          Avatar asset
        </span>
        <span>Updated {avatar.updatedAt}</span>
      </div>
      <div className="mt-3 flex items-center gap-1.5 border-t border-border/60 pt-2">
        <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => onEdit(avatar.id)}>
          <Edit3 className="size-3.5" />
          Edit
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => onShare(avatar.id)}>
          <Share2 className="size-3.5" />
          Share
        </Button>
        <Button type="button" size="sm" variant="ghost" className="ml-auto h-7 px-2 text-xs text-destructive hover:text-destructive" onClick={() => onDelete(avatar.id)}>
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>
    </li>
  )
}
