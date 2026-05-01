"use client"
import { useEffect, useState } from "react"

import Image from "next/image"
import Link from "next/link"
import { CheckCircle2, Clock, Heart, Package, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCreatorReviewAggregate } from "@/features/reviews/use-creator-reviews"
import type { Creator } from "@/features/site/marketplace/types"
import { cn } from "@/lib/utils"

interface CreatorProfileCardProps {
  creator: Creator
  featured?: boolean
  onUnsave?: () => void
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

export function CreatorProfileCard({ creator, featured = false, onUnsave }: CreatorProfileCardProps) {
  const profileHref = `/creators/${creator.id}`
  const { averageRating, reviewCount } = useCreatorReviewAggregate({
    creatorId: creator.id,
    baseRating: creator.rating,
    baseCount: creator.reviewCount,
  })
  const displayRating = averageRating || creator.rating
  const ratingLabel = `${displayRating.toFixed(1)} out of 5 stars, ${reviewCount} reviews`

  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetch("/api/profile/save-creator")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.savedCreators)) {
          setIsSaved(data.savedCreators.includes(creator.id))
        }
      })
      .catch((err) => console.error("Error loading saved status", err))
  }, [creator.id])

  const toggleSave = async (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (isLoading) return
    setIsLoading(true)
    try {
      const method = isSaved ? "DELETE" : "POST"
      const res = await fetch("/api/profile/save-creator", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId: creator.id }),
      })
      if (res.ok) {
        setIsSaved(!isSaved)
        if (method === "DELETE") {
          onUnsave?.()
        }
      }
    } catch (err) {
      console.error("Error toggling save", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <article className="h-full">
      <Card
        className={cn(
          "group/card flex h-full flex-col gap-0 overflow-hidden py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
          featured && "ring-1 ring-primary/25"
        )}
      >
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={creator.coverImage}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover/card:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/40 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {creator.isAvailable ? (
              <Badge
                variant="secondary"
                className="border-0 bg-emerald-600/90 text-xs text-white dark:bg-emerald-600/85"
              >
                Available now
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Away
              </Badge>
            )}
          </div>

          <button
            type="button"
            className={cn(
              "absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-all focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group-hover/card:opacity-100",
              isSaved 
                ? "bg-background text-rose-500 opacity-100" 
                : "bg-background/85 text-muted-foreground opacity-0 hover:bg-background hover:text-primary"
            )}
            onClick={toggleSave}
            aria-label={isSaved ? `Remove ${creator.name} from favorites` : `Save ${creator.name} to favorites`}
            disabled={isLoading}
          >
            <Heart className={cn("h-4 w-4", isSaved && "fill-rose-500")} aria-hidden />
          </button>
        </div>

        <CardContent className="relative flex flex-1 flex-col gap-0 pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <Image
                src={creator.avatar}
                alt=""
                width={48}
                height={48}
                className="size-12 rounded-full object-cover ring-2 ring-background"
              />
              {creator.isVerified ? (
                <span
                  className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
                  aria-label="Verified creator"
                >
                  <CheckCircle2 className="size-3" aria-hidden />
                </span>
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold leading-snug text-card-foreground">{creator.name}</h3>
              <p className="text-sm text-muted-foreground">{creator.tagline}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <div role="group" aria-label={ratingLabel} className="flex items-center gap-1">
              <Star className="size-4 fill-accent text-accent" aria-hidden />
              <span className="font-medium tabular-nums">{displayRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="size-3.5 shrink-0" aria-hidden />
              <span>{creator.responseTime}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 py-3">
            {creator.specialties.slice(0, 3).map((specialty) => (
              <Badge key={specialty} variant="secondary" className="text-xs font-normal">
                {specialty}
              </Badge>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-end gap-1 text-muted-foreground">
            <Package className="size-3 shrink-0" aria-hidden />
            <span className="tabular-nums text-xs">{creator.completedOrders} orders</span>
          </div>
        </CardContent>

        <CardFooter className="mt-auto flex flex-row items-center justify-between gap-3 border-border/70 bg-muted/30 py-3">
          <div>
            <p className="text-xs text-muted-foreground">Starting at</p>
            <p className="text-lg font-semibold tabular-nums">
              {priceFormatter.format(creator.startingPrice)}
            </p>
          </div>
          <Link href={profileHref} className={cn(buttonVariants({ size: "sm" }), "shrink-0")}>
            View profile
          </Link>
        </CardFooter>
      </Card>
    </article>
  )
}
