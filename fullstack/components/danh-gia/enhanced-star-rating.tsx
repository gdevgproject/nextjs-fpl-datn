"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedStarRatingProps {
  value: number
  onChange: (value: number) => void
  size?: "sm" | "md" | "lg"
  readOnly?: boolean
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
}

const labelText = ["Rất không hài lòng", "Không hài lòng", "Bình thường", "Hài lòng", "Rất hài lòng"]

export function EnhancedStarRating({ value, onChange, size = "md", readOnly = false }: EnhancedStarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = (rating: number) => {
    if (readOnly) return

    onChange(rating)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)
  }

  const handleMouseEnter = (rating: number) => {
    if (readOnly) return
    setHoverValue(rating)
  }

  const handleMouseLeave = () => {
    if (readOnly) return
    setHoverValue(0)
  }

  const displayValue = hoverValue || value
  const label = displayValue > 0 ? labelText[displayValue - 1] : ""

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            className={cn(
              "transition-transform",
              isAnimating && rating <= value && "animate-bounce",
              !readOnly && "cursor-pointer hover:scale-110",
              readOnly && "cursor-default",
            )}
            disabled={readOnly}
            aria-label={`Rate ${rating} out of 5 stars`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors",
                rating <= displayValue ? "fill-amber-500 text-amber-500" : "fill-muted text-muted-foreground",
              )}
            />
          </button>
        ))}

        {!readOnly && (
          <span className="ml-2 text-sm font-medium text-muted-foreground transition-opacity">{label}</span>
        )}
      </div>
    </div>
  )
}

