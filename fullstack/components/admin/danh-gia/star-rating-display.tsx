import { Star, StarHalf } from "lucide-react"

interface StarRatingDisplayProps {
  rating: number
  size?: "sm" | "md" | "lg"
}

export function StarRatingDisplay({ rating, size = "md" }: StarRatingDisplayProps) {
  // Kích thước sao dựa trên prop size
  const starSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size]

  // Màu sao dựa trên rating
  const starColor =
    {
      1: "text-red-500",
      2: "text-orange-500",
      3: "text-yellow-500",
      4: "text-lime-500",
      5: "text-green-500",
    }[Math.ceil(rating)] || "text-yellow-500"

  // Tạo mảng sao
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`star-${i}`} className={`fill-current ${starColor} ${starSize}`} />
      ))}

      {hasHalfStar && <StarHalf className={`fill-current ${starColor} ${starSize}`} />}

      {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
        <Star key={`empty-star-${i}`} className={`text-gray-300 ${starSize}`} />
      ))}

      <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  )
}

