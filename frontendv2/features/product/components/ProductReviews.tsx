"use client"

import { Button } from "@/components/ui/Button"
import { useReviews } from "@/features/product/hooks/useReviews"
import { cn } from "@/utils/helpers"
import { Star } from "lucide-react"
import { useState } from "react"
import { CommentList } from "./shared/CommentList"

interface ProductReviewsProps {
  productId: string
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<number>(5)
  const { reviews, isLoading } = useReviews(productId)

  const totalReviews = reviews.length
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0

  // Calculate rating distribution
  const ratingCounts = Array.from({ length: 5 }, (_, i) => {
    const rating = 5 - i
    return reviews.filter((review) => review.rating === rating).length
  })

  const filteredReviews = selectedFilter
    ? reviews.filter((review) => review.rating === selectedFilter)
    : reviews

  return (
    <div className="space-y-8">
      {/* Rating Summary - 2 Columns */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="flex flex-col items-start space-y-4 max-w-[200px]">
          <span className="text-lg">Tuyệt vời</span>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold">5.0</span>
            <Star className="h-6 w-6 fill-warning-5 text-warning-5" />
          </div>
          <Button
            onClick={() => setShowReviewForm(true)}
            className="w-full bg-primary-5 text-white hover:bg-primary-20"
          >
            Gửi đánh giá
          </Button>
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingCounts[5 - rating]
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

            return (
              <div key={rating} className="flex items-center gap-2">
                <div className="flex items-center w-24">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={cn(
                          "h-4 w-4",
                          idx < rating
                            ? "fill-warning-5 text-warning-5"
                            : "fill-gray-200 text-gray-200"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-warning-5 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm text-gray-500">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Lọc theo:</span>
        <div className="flex gap-2">
          {[5, 4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              onClick={() => setSelectedFilter(stars)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm transition-colors",
                selectedFilter === stars
                  ? "bg-primary-5 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-primary-5"
              )}
            >
              {stars} sao
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <CommentList comments={filteredReviews} showRating />
    </div>
  )
}
