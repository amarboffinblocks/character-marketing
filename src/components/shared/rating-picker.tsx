"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

type RatingPickerProps = {
  value: number
  onChange: (value: number) => void
  max?: number
  size?: number
  className?: string
}

export function RatingPicker({
  value,
  onChange,
  max = 5,
  size = 32,
  className
}: RatingPickerProps) {
  const [hoverValue, setHoverValue] = useState(0)
  
  const displayValue = hoverValue || value

  return (
    <div 
      className={cn("flex items-center gap-1.5", className)}
      onMouseLeave={() => setHoverValue(0)}
    >
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1
        const isHighlighted = starValue <= displayValue

        return (
          <button
            key={index}
            type="button"
            className="group relative  cursor-pointer outline-none transition-transform active:scale-90"
            style={{ width: size + 8, height: size + 8 }}
            onClick={(e) => {
              e.preventDefault()
              onChange(starValue)
            }}
            aria-label={`Rate ${starValue} out of ${max}`}
          >
            <div className={cn(
              "flex size-full items-center justify-center rounded-xl transition-colors",
            )}>
              <Star 
                size={size} 
                className={cn(
                  "transition-all duration-200",
                  isHighlighted 
                    ? "text-yellow-400 fill-yellow-400 " 
                    : "text-muted-foreground/30 fill-transparent"
                )}
                strokeWidth={1.5}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}
