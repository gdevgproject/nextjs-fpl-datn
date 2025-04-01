import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function StarRating({ rating, maxRating = 5, size = "md", showText = false }: StarRatingProps) {
  const sizeClass = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <div className="flex items-center">
      <div className="flex">
        {Array.from({ length: maxRating }).map((_, i) => (
          <Star
            key={i}
            className={`${sizeClass[size]} ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "fill-none text-muted-foreground"
            }`}
          />
        ))}
      </div>
      {showText && (
        <span className="ml-2 text-sm">
          {rating}/{maxRating}
        </span>
      )}
    </div>
  )
}

