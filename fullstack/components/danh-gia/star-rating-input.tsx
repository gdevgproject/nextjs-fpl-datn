"use client"

import { useState } from "react"
import { Star } from "lucide-react"

interface StarRatingInputProps {
  value: number
  onChange: (value: number) => void
}

export function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = useState(0)

  const handleMouseOver = (index: number) => {
    setHoverValue(index)
  }

  const handleMouseLeave = () => {
    setHoverValue(0)
  }

  const handleClick = (index: number) => {
    onChange(index)
  }

  const labels = ["Rất không hài lòng", "Không hài lòng", "Bình thường", "Hài lòng", "Rất hài lòng"]

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((index) => (
          <button
            key={index}
            type="button"
            className="p-1 focus:outline-none"
            onMouseOver={() => handleMouseOver(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
            aria-label={`Rate ${index} out of 5 stars`}
          >
            <Star
              className={`h-8 w-8 transition-all ${
                index <= (hoverValue || value) ? "fill-amber-500 text-amber-500" : "fill-muted text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
      {(hoverValue || value) > 0 && <p className="text-sm font-medium">{labels[(hoverValue || value) - 1]}</p>}
    </div>
  )
}

