"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

type RatingProps = {
  rating: number
  max?: number
  size?: number
  className?: string
}

export function Rating({
  rating,
  max = 5,
  size = 18,
  className
}: RatingProps) {
  // Ensure rating is between 0 and max
  const validatedRating = Math.min(Math.max(rating, 0), max)

  return (
    <div 
      className={cn("flex items-center gap-0.5", className)}
      aria-label={`Rating: ${validatedRating} out of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1
        const isFull = starValue <= validatedRating
        const isPartial = starValue > validatedRating && starValue - 1 < validatedRating
        const partialPercentage = isPartial ? (validatedRating % 1) * 100 : 0

        return (
          <div key={index} className="relative leading-none" style={{ width: size, height: size }}>
            {/* Empty Background Star */}
            <Star 
              size={size} 
              className="text-muted-foreground/30 fill-transparent" 
              strokeWidth={1.5}
            />
            
            {/* Filled Overlap Star */}
            {(isFull || isPartial) && (
              <div 
                className="absolute inset-0 overflow-hidden" 
                style={{ width: isFull ? "100%" : `${partialPercentage}%` }}
              >
                <Star 
                  size={size} 
                  className="text-yellow-400 fill-yellow-400" 
                  strokeWidth={1.5}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
