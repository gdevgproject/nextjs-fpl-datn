"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { Star, MessageCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface ReviewProps {
  id: number
  product_id: number
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer_profile: {
    display_name: string | null
    avatar_url: string | null
  } | null
  review_replies: Array<{
    id: number
    review_id: number
    user_id: string
    reply_text: string
    created_at: string
    replier_profile: {
      display_name: string | null
      avatar_url: string | null
    } | null
  }>
}

interface ProductReviewsProps {
  reviews: ReviewProps[]
  productId: number
}

export default function ProductReviews({ reviews, productId }: ProductReviewsProps) {
  const [expandedReviews, setExpandedReviews] = useState<Record<number, boolean>>({})

  const toggleReplyVisibility = (reviewId: number) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }))
  }

  // Calculate average rating
  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "0.0"

  // Count ratings by star
  const ratingCounts = reviews.reduce(
    (counts, review) => {
      counts[review.rating - 1]++
      return counts
    },
    [0, 0, 0, 0, 0],
  )

  // Calculate rating percentages
  const ratingPercentages = ratingCounts.map((count) => (reviews.length > 0 ? (count / reviews.length) * 100 : 0))

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Chưa có đánh giá nào cho sản phẩm này.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 p-6 rounded-lg">
        <div className="flex flex-col items-center justify-center">
          <div className="text-4xl font-bold">{averageRating}</div>
          <div className="flex items-center mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  Number.parseFloat(averageRating) >= star
                    ? "text-yellow-400 fill-yellow-400"
                    : Number.parseFloat(averageRating) >= star - 0.5
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground mt-2">{reviews.length} đánh giá</div>
        </div>

        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((star, index) => (
            <div key={star} className="flex items-center gap-2">
              <div className="flex items-center w-12">
                <span className="text-sm">{star}</span>
                <Star className="h-4 w-4 ml-1 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400" style={{ width: `${ratingPercentages[5 - star]}%` }}></div>
              </div>
              <div className="w-12 text-right text-sm text-muted-foreground">{ratingCounts[5 - star]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4 space-y-4">
            {/* Review Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={review.reviewer_profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {review.reviewer_profile?.display_name
                      ? review.reviewer_profile.display_name.charAt(0).toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{review.reviewer_profile?.display_name || "Người dùng ẩn danh"}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(review.created_at), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </div>
                </div>
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${review.rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
            </div>

            {/* Review Content */}
            <div>
              {review.comment ? (
                <p className="text-sm">{review.comment}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Không có nội dung đánh giá.</p>
              )}
            </div>

            {/* Replies */}
            {review.review_replies.length > 0 && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center text-sm"
                  onClick={() => toggleReplyVisibility(review.id)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {review.review_replies.length} phản hồi
                  {expandedReviews[review.id] ? (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  )}
                </Button>

                {expandedReviews[review.id] && (
                  <div className="mt-4 space-y-4">
                    <Separator />
                    {review.review_replies.map((reply) => (
                      <div key={reply.id} className="pl-4 border-l-2 mt-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={reply.replier_profile?.avatar_url || undefined} />
                            <AvatarFallback>
                              {reply.replier_profile?.display_name
                                ? reply.replier_profile.display_name.charAt(0).toUpperCase()
                                : "A"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">
                              {reply.replier_profile?.display_name || "Quản trị viên"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(reply.created_at), {
                                addSuffix: true,
                                locale: vi,
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-sm">{reply.reply_text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
