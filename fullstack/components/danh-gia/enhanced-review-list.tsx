"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EnhancedReviewItem } from "@/components/danh-gia/enhanced-review-item"
import { Loader2 } from "lucide-react"

interface EnhancedReviewListProps {
  reviews: {
    id: number
    user: string
    date: string
    rating: number
    title: string
    comment: string
    verified: boolean
    helpful: number
    avatar: string
    recommend?: boolean
    images?: string[]
    replies?: {
      id: number
      staff_name: string
      reply_text: string
      created_at: string
    }[]
  }[]
  onHelpfulVote: (reviewId: number) => void
}

export function EnhancedReviewList({ reviews, onHelpfulVote }: EnhancedReviewListProps) {
  const [visibleReviews, setVisibleReviews] = useState(5)
  const [helpfulReviews, setHelpfulReviews] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadMore = () => {
    setIsLoading(true)
    // Simulate loading delay
    setTimeout(() => {
      setVisibleReviews((prev) => prev + 5)
      setIsLoading(false)
    }, 500)
  }

  const handleHelpful = (reviewId: number) => {
    if (helpfulReviews.includes(reviewId)) return

    setHelpfulReviews([...helpfulReviews, reviewId])
    onHelpfulVote(reviewId)
  }

  if (reviews.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Không tìm thấy đánh giá nào phù hợp với bộ lọc.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.slice(0, visibleReviews).map((review) => (
        <EnhancedReviewItem
          key={review.id}
          review={review}
          isHelpful={helpfulReviews.includes(review.id)}
          onHelpful={() => handleHelpful(review.id)}
        />
      ))}

      {visibleReviews < reviews.length && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleLoadMore} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải
              </>
            ) : (
              `Xem thêm đánh giá (${reviews.length - visibleReviews})`
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

