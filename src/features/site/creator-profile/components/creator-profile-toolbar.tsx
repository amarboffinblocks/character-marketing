"use client"

import { Heart, MessageSquare, Share2 } from "lucide-react"
import { useCallback, useState } from "react"

import { buttonVariants } from "@/components/ui/button"
import { CreatorChatPanel } from "@/features/site/creator-profile/components/creator-chat-panel"
import { cn } from "@/lib/utils"

type CreatorProfileToolbarProps = {
  creatorId: string
  creatorName: string
  creatorHandle: string
  creatorAvatar: string
  /** Path only, e.g. `/creators/luna-pixel` */
  profilePath: string
  className?: string
}

/**
 * Favorite, share, and contact actions. Share copies URL or uses Web Share API when available.
 */
export function CreatorProfileToolbar({
  creatorId,
  creatorName,
  creatorHandle,
  creatorAvatar,
  profilePath,
  className,
}: CreatorProfileToolbarProps) {
  const [chatOpen, setChatOpen] = useState(false)

  const share = useCallback(async () => {
    const url =
      typeof window !== "undefined" ? `${window.location.origin}${profilePath}` : profilePath

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${creatorName} on Character Market`,
          url,
        })
        return
      }
      await navigator.clipboard.writeText(url)
    } catch {
      // User cancelled share or clipboard denied — ignore
    }
  }, [creatorName, profilePath])

  return (
    <>
      <div className={cn("flex flex-wrap items-center justify-end gap-2", className)}>
        <button
          type="button"
          className={cn(buttonVariants({ variant: "outline", size: "icon" }), "size-10")}
          aria-label={`Save ${creatorName} to favorites`}
        >
          <Heart className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          className={cn(buttonVariants({ variant: "outline", size: "icon" }), "size-10")}
          aria-label={`Share ${creatorName}'s profile`}
          onClick={() => void share()}
        >
          <Share2 className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          className={cn(buttonVariants({ size: "default" }), "h-10 gap-2 px-5")}
          onClick={() => setChatOpen(true)}
        >
          <MessageSquare className="size-4" aria-hidden />
          Chat
        </button>
      </div>

      <CreatorChatPanel
        open={chatOpen}
        onOpenChange={setChatOpen}
        creatorId={creatorId}
        creatorName={creatorName}
        creatorHandle={creatorHandle}
        creatorAvatar={creatorAvatar}
      />
    </>
  )
}
