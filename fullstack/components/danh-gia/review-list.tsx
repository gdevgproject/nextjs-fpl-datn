"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ReviewItem } from "@/components/danh-gia/review-item"

interface Review {
  id: number
  user: string
  date: string
  rating: number
  title: string
  comment: string
  verified: boolean
  helpful: number
  avatar: string
}

interface ReviewListProps {
  reviews: Review[]
  productId: number
}

export function ReviewList({ reviews: initialReviews, productId }: ReviewListProps) {
  const [reviews, setReviews] = useState(initialReviews)
  const [sortBy, setSortBy] = useState("newest")
  const [visibleReviews, setVisibleReviews] = useState(5)
  const [helpfulReviews, setHelpfulReviews] = useState<number[]>([])

  const handleSortChange = (value: string) => {
    setSortBy(value)
    const sortedReviews = [...reviews]

    switch (value) {
      case "newest":
        sortedReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case "oldest":
        sortedReviews.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        break
      case "highest":
        sortedReviews.sort((a, b) => b.rating - a.rating)
        break
      case "lowest":
        sortedReviews.sort((a, b) => a.rating - b.rating)
        break
      case "helpful":
        sortedReviews.sort((a, b) => b.helpful - a.helpful)
        break
    }

    setReviews(sortedReviews)
  }

  const handleLoadMore = () => {
    setVisibleReviews((prev) => prev + 5)
  }

  const handleHelpful = (reviewId: number) => {
    if (helpfulReviews.includes(reviewId)) return

    setHelpfulReviews([...helpfulReviews, reviewId])
    setReviews(reviews.map((review) => (review.id === reviewId ? { ...review, helpful: review.helpful + 1 } : review)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{reviews.length} đánh giá</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Sắp xếp theo:</span>
          <Select defaultValue={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="oldest">Cũ nhất</SelectItem>
              <SelectItem value="highest">Đánh giá cao nhất</SelectItem>
              <SelectItem value="lowest">Đánh giá thấp nhất</SelectItem>
              <SelectItem value="helpful">Hữu ích nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.slice(0, visibleReviews).map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              isHelpful={helpfulReviews.includes(review.id)}
              onHelpful={() => handleHelpful(review.id)}
            />
          ))}

          {visibleReviews < reviews.length && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleLoadMore}>
                Xem thêm đánh giá
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Chưa có đánh giá nào cho sản phẩm này.</p>
          <Button className="mt-4" asChild>
            <a href={`/san-pham/danh-gia?product_id=${productId}`}>Viết đánh giá đầu tiên</a>
          </Button>
        </div>
      )}
    </div>
  )
}

