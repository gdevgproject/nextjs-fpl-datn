"use client"

import { useState } from "react"
import { Star } from "lucide-react"

interface StarRatingInputProps {
  value: number
  onChange: (value: number) => void
  maxRating?: number
  size?: "sm" | "md" | "lg"
}

export function StarRatingInput({ value, onChange, maxRating = 5, size = "md" }: StarRatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  const labels = ["Rất tệ", "Tệ", "Bình thường", "Tốt", "Rất tốt"]

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <div className="flex">
          {Array.from({ length: maxRating }).map((_, i) => (
            <button
              key={i}
              type="button"
              className="focus:outline-none"
              onClick={() => onChange(i + 1)}
              onMouseEnter={() => setHoverRating(i + 1)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <Star
                className={`${sizeClass[size]} transition-all ${
                  i < (hoverRating || value)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-none text-muted-foreground hover:fill-yellow-200 hover:text-yellow-200"
                }`}
              />
            </button>
          ))}
        </div>
        {value > 0 && <span className="ml-2 text-sm font-medium">{labels[value - 1]}</span>}
      </div>
    </div>
  )
}

