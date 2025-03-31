"use client"

import { useState } from "react"
import { EnhancedUserReviewItem } from "@/components/tai-khoan/enhanced-user-review-item"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface EnhancedUserReviewListProps {
  reviews: {
    id: number
    product_id: number
    product_name: string
    product_image: string
    rating: number
    title: string
    comment: string
    created_at: string
    is_approved: boolean
    replies?: {
      id: number
      staff_name: string
      reply_text: string
      created_at: string
    }[]
  }[]
  onDelete: (reviewId: number) => void
}

export function EnhancedUserReviewList({ reviews, onDelete }: EnhancedUserReviewListProps) {
  const [visibleReviews, setVisibleReviews] = useState(5)
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadMore = () => {
    setIsLoading(true)
    // Simulate loading delay
    setTimeout(() => {
      setVisibleReviews((prev) => prev + 5)
      setIsLoading(false)
    }, 500)
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
        <EnhancedUserReviewItem key={review.id} review={review} onDelete={onDelete} />
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

