"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Star } from "lucide-react"

interface EnhancedReviewFilterProps {
  totalReviews: number
  ratingCounts: {
    rating: number
    count: number
  }[]
  onFilterChange: (rating: number | null) => void
  selectedRating: number | null
}

export function EnhancedReviewFilter({
  totalReviews,
  ratingCounts,
  onFilterChange,
  selectedRating,
}: EnhancedReviewFilterProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Lọc đánh giá</h3>
      <div className="space-y-2">
        <Button
          variant={selectedRating === null ? "default" : "outline"}
          className="w-full justify-between"
          onClick={() => onFilterChange(null)}
        >
          <span>Tất cả đánh giá</span>
          <span className="ml-2 text-sm">{totalReviews}</span>
        </Button>

        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingCounts.find((r) => r.rating === rating)?.count || 0
          const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0

          return (
            <Button
              key={rating}
              variant={selectedRating === rating ? "default" : "outline"}
              className="w-full justify-between"
              onClick={() => onFilterChange(rating)}
              disabled={count === 0}
            >
              <div className="flex items-center">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < rating ? "fill-amber-500 text-amber-500" : "fill-muted text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={percent} className="h-2 w-16" />
                <span className="text-sm">{count}</span>
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
}

