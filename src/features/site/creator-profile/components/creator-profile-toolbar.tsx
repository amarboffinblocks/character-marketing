"use client"

import Link from "next/link"
import { Heart, MessageSquare, Share2, Star } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

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
  isAuthenticated: boolean
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
  isAuthenticated,
  className,
}: CreatorProfileToolbarProps) {
  const [chatOpen, setChatOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    fetch("/api/profile/save-creator")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.savedCreators)) {
          setIsSaved(data.savedCreators.includes(creatorId))
        }
      })
      .catch((err) => console.error("Error fetching saved creators:", err))
  }, [creatorId, isAuthenticated])

  const toggleSave = useCallback(async () => {
    if (!isAuthenticated || isLoading) return
    setIsLoading(true)
    try {
      const method = isSaved ? "DELETE" : "POST"
      const res = await fetch("/api/profile/save-creator", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ creatorId }),
      })
      if (res.ok) {
        setIsSaved(!isSaved)
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err)
    } finally {
      setIsLoading(false)
    }
  }, [creatorId, isAuthenticated, isSaved, isLoading])

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
      {isAuthenticated ? (
        <div className={cn("flex flex-wrap items-center justify-end gap-2", className)}>
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "size-10",
              isSaved && "text-rose-500 border-rose-200 hover:bg-rose-50 bg-rose-50/50"
            )}
            aria-label={isSaved ? `Remove ${creatorName} from favorites` : `Save ${creatorName} to favorites`}
            onClick={toggleSave}
            disabled={isLoading}
          >
            <Heart className={cn("size-4", isSaved && "fill-rose-500")} aria-hidden />
          </button>
          <button
            type="button"
            className={cn(buttonVariants({ variant: "outline", size: "icon" }), "size-10")}
            aria-label={`Share ${creatorName}'s profile`}
            onClick={() => void share()}
          >
            <Share2 className="size-4" aria-hidden />
          </button>
          <Link
            href={`/creators/${creatorId}/review`}
            className={cn(buttonVariants({ variant: "outline", size: "default" }), "h-10 gap-2 px-4")}
            aria-label={`Leave a review for ${creatorName}`}
          >
            <Star className="size-4" aria-hidden />
            Leave Review
          </Link>
          <button
            type="button"
            className={cn(buttonVariants({ size: "default" }), "h-10 gap-2 px-5")}
            onClick={() => setChatOpen(true)}
          >
            <MessageSquare className="size-4" aria-hidden />
            Chat
          </button>
        </div>
      ) : null}

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
