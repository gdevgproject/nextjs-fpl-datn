import { Star } from "lucide-react"

interface ReviewSummaryProps {
  averageRating: number
  totalReviews: number
  ratingCounts: {
    rating: number
    count: number
  }[]
}

export function ReviewSummary({ averageRating, totalReviews, ratingCounts }: ReviewSummaryProps) {
  return (
    <div className="flex flex-col items-center p-4 border rounded-lg">
      <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
      <div className="flex my-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < Math.round(averageRating) ? "fill-amber-500 text-amber-500" : "fill-muted text-muted-foreground"
            }`}
          />
        ))}
      </div>
      <div className="text-sm text-muted-foreground mb-4">{totalReviews} đánh giá</div>

      <div className="w-full space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingCounts.find((r) => r.rating === rating)?.count || 0
          const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0

          return (
            <div key={rating} className="flex items-center">
              <div className="flex items-center w-12">
                <span>{rating}</span>
                <Star className="h-4 w-4 ml-1 fill-amber-500 text-amber-500" />
              </div>
              <div className="flex-1 mx-2">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${percent}%` }} />
                </div>
              </div>
              <div className="w-10 text-right text-sm text-muted-foreground">{count}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

