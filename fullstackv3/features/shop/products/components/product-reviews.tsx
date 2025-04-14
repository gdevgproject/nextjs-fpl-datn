"use client"

import { useState, useEffect, memo } from "react"
import { Star, StarHalf, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils/format"
import { DEFAULT_AVATAR_URL } from "@/lib/constants"
import { ProductReviewForm } from "./product-review-form"

interface ProductReviewsProps {
  reviews: any[]
  productId: number
  hasPurchased: boolean
  initialShowForm?: boolean
}

export const ProductReviews = ({ reviews, productId, hasPurchased, initialShowForm = false }: ProductReviewsProps) => {
  const [showReviewForm, setShowReviewForm] = useState(initialShowForm)

  // Cập nhật showReviewForm khi initialShowForm thay đổi
  useEffect(() => {
    setShowReviewForm(initialShowForm)
  }, [initialShowForm])

  // Tính điểm đánh giá trung bình
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  // Đếm số lượng đánh giá theo số sao
  const ratingCounts = [0, 0, 0, 0, 0] // 1-5 sao
  reviews.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating - 1]++
    }
  })

  // Tính phần trăm cho mỗi mức đánh giá
  const ratingPercentages = ratingCounts.map((count) => (reviews.length > 0 ? (count / reviews.length) * 100 : 0))

  // Hiển thị số sao
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating - fullStars >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />)
    }

    return stars
  }

  const MemoizedReviewItem = memo(ReviewItem)

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold">Đánh giá sản phẩm</h2>

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Tổng quan đánh giá */}
        <Card>
          <CardHeader>
            <CardTitle>Tổng quan</CardTitle>
            <CardDescription>Dựa trên {reviews.length} đánh giá</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="mt-2 flex">{renderStars(averageRating)}</div>
            </div>

            <div className="mt-6 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <div className="flex w-12 justify-end">
                    <span className="text-sm">{star} sao</span>
                  </div>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-yellow-400"
                      style={{ width: `${ratingPercentages[star - 1]}%` }}
                    />
                  </div>
                  <div className="w-12 text-sm">{ratingCounts[star - 1]}</div>
                </div>
              ))}
            </div>

            {hasPurchased && (
              <div className="mt-6">
                <Button className="w-full" onClick={() => setShowReviewForm(!showReviewForm)}>
                  {showReviewForm ? "Hủy" : "Viết đánh giá"}
                </Button>
              </div>
            )}

            {!hasPurchased && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Bạn cần mua sản phẩm này để có thể đánh giá
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danh sách đánh giá */}
        <div className="md:col-span-2">
          {showReviewForm && hasPurchased && (
            <div className="mb-6">
              <ProductReviewForm
                productId={productId}
                onCancel={() => setShowReviewForm(false)}
                onSuccess={() => setShowReviewForm(false)}
              />
            </div>
          )}

          {reviews.length > 0 ? (
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">Tất cả ({reviews.length})</TabsTrigger>
                <TabsTrigger value="5">5 Sao ({ratingCounts[4]})</TabsTrigger>
                <TabsTrigger value="4">4 Sao ({ratingCounts[3]})</TabsTrigger>
                <TabsTrigger value="3">3 Sao ({ratingCounts[2]})</TabsTrigger>
                <TabsTrigger value="2">2 Sao ({ratingCounts[1]})</TabsTrigger>
                <TabsTrigger value="1">1 Sao ({ratingCounts[0]})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4 space-y-4">
                {reviews.map((review) => (
                  <MemoizedReviewItem key={review.id} review={review} />
                ))}
              </TabsContent>

              {[5, 4, 3, 2, 1].map((star) => (
                <TabsContent key={star} value={star.toString()} className="mt-4 space-y-4">
                  {reviews
                    .filter((review) => review.rating === star)
                    .map((review) => (
                      <MemoizedReviewItem key={review.id} review={review} />
                    ))}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="rounded-lg border p-6 text-center">
              <p className="text-muted-foreground">Chưa có đánh giá nào cho sản phẩm này</p>
              {hasPurchased && !showReviewForm && (
                <Button className="mt-4" onClick={() => setShowReviewForm(true)}>
                  Viết đánh giá đầu tiên
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ReviewItem({ review }: { review: any }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={review.profiles?.avatar_url || DEFAULT_AVATAR_URL}
              alt={review.profiles?.display_name || "Người dùng"}
            />
            <AvatarFallback>{review.profiles?.display_name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{review.profiles?.display_name || "Người dùng"}</div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-sm">{review.comment}</div>

      {/* Phản hồi từ shop */}
      {review.replies && review.replies.length > 0 && (
        <div className="mt-3 rounded-lg bg-muted p-3">
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <div>
              <div className="text-xs font-medium">Phản hồi từ shop</div>
              <div className="mt-1 text-sm">{review.replies[0].reply_text}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

