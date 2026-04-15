import { CheckCircle2, Clock, Hexagon, Star } from "lucide-react"

import type { CreatorProfile } from "@/features/creator-profile/model/creator-profile-types"
import { cn } from "@/lib/utils"

type CreatorProfileStatBarProps = {
  profile: CreatorProfile
  className?: string
}

/**
 * Horizontal trust metrics: rating, response time, completion, verification.
 */
export function CreatorProfileStatBar({ profile, className }: CreatorProfileStatBarProps) {
  const ratingLabel = `${profile.rating.toFixed(1)} out of 5 stars, ${profile.reviewCount} reviews`

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 rounded-xl  px-4 py-4 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border/60 lg:py-3",
        className
      )}
    >
      <div
        className="flex items-center gap-2.5 lg:px-2"
        role="group"
        aria-label={ratingLabel}
      >
        <Star className="size-5 shrink-0 fill-amber-400 text-amber-400" aria-hidden />
        <p className="text-sm">
          <span className="font-semibold tabular-nums text-foreground">{profile.rating.toFixed(1)}</span>
          <span className="text-muted-foreground">
            {" "}
            ({profile.reviewCount} reviews)
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2.5 lg:px-2">
        <Clock className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <p className="text-sm text-foreground">Responds {profile.responseTime}</p>
      </div>

      <div className="flex items-center gap-2.5 lg:px-2">
        <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-500" aria-hidden />
        <p className="text-sm text-foreground">{profile.completionRate}% completion rate</p>
      </div>

      <div className="flex items-center gap-2.5 lg:px-2">
        {profile.isVerified ? (
          <>
            <Hexagon className="size-5 shrink-0 text-primary" aria-hidden />
            <p className="text-sm font-medium text-foreground">Verified Creator</p>
          </>
        ) : (
          <>
            <Hexagon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">Unverified</p>
          </>
        )}
      </div>
    </div>
  )
}
