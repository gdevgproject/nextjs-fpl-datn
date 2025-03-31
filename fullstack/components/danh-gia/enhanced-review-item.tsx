"use client"

import { useState } from "react"
import Image from "next/image"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ThumbsUp, MessageCircle, ThumbsDown, CheckCircle, ChevronDown, ChevronUp, ImageIcon } from "lucide-react"
import { EnhancedStarRating } from "@/components/danh-gia/enhanced-star-rating"
import { EnhancedReviewImageGallery } from "@/components/danh-gia/enhanced-review-image-gallery"

interface EnhancedReviewItemProps {
  review: {
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
  }
  isHelpful: boolean
  onHelpful: () => void
}

export function EnhancedReviewItem({ review, isHelpful, onHelpful }: EnhancedReviewItemProps) {
  const [showReplies, setShowReplies] = useState(false)
  const [showFullComment, setShowFullComment] = useState(false)
  const [showAllImages, setShowAllImages] = useState(false)

  const hasLongComment = review.comment.length > 300
  const displayComment = showFullComment ? review.comment : review.comment.slice(0, 300)

  const reviewImages =
    review.images?.map((image, index) => ({
      src: image,
      alt: `Review image ${index + 1}`,
      reviewId: review.id,
    })) || []

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="relative h-10 w-10 overflow-hidden rounded-full flex-shrink-0">
          <Image src={review.avatar || "/placeholder.svg"} alt={review.user} fill className="object-cover" />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center">
                <h4 className="font-medium">{review.user}</h4>
                {review.verified && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Đã mua hàng
                  </span>
                )}
              </div>
              <div className="flex items-center mt-1">
                <EnhancedStarRating value={review.rating} onChange={() => {}} size="sm" readOnly />
                <span className="text-xs text-muted-foreground ml-2">{formatDate(review.date)}</span>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <h5 className="font-medium">{review.title}</h5>
            <p className="text-sm text-muted-foreground mt-1">
              {displayComment}
              {hasLongComment && !showFullComment && "..."}
            </p>

            {hasLongComment && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => setShowFullComment(!showFullComment)}
              >
                {showFullComment ? "Ẩn bớt" : "Xem thêm"}
              </Button>
            )}
          </div>

          {review.recommend !== undefined && (
            <div className="mt-2 flex items-center text-sm">
              {review.recommend ? (
                <>
                  <ThumbsUp className="mr-1.5 h-4 w-4 text-green-500" />
                  <span>Tôi giới thiệu sản phẩm này</span>
                </>
              ) : (
                <>
                  <ThumbsDown className="mr-1.5 h-4 w-4 text-red-500" />
                  <span>Tôi không giới thiệu sản phẩm này</span>
                </>
              )}
            </div>
          )}

          {reviewImages.length > 0 && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                className="mb-2 h-8 text-xs"
                onClick={() => setShowAllImages(!showAllImages)}
              >
                <ImageIcon className="mr-1 h-3 w-3" />
                {showAllImages ? "Ẩn hình ảnh" : `Xem hình ảnh (${reviewImages.length})`}
              </Button>

              {showAllImages && (
                <div className="mt-2">
                  <EnhancedReviewImageGallery images={reviewImages} />
                </div>
              )}
            </div>
          )}

          <div className="mt-3 flex items-center">
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onHelpful} disabled={isHelpful}>
              <ThumbsUp className="mr-1 h-3 w-3" />
              Hữu ích <span className="ml-1">({review.helpful})</span>
            </Button>

            {review.replies && review.replies.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="ml-2 h-8 text-xs"
              >
                <MessageCircle className="mr-1 h-3 w-3" />
                {showReplies ? "Ẩn phản hồi" : `Xem phản hồi (${review.replies.length})`}
                {showReplies ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Shop reply (if exists) */}
      {showReplies && review.replies && review.replies.length > 0 && (
        <div className="ml-14 space-y-3">
          {review.replies.map((reply) => (
            <div key={reply.id} className="rounded-lg bg-muted p-4">
              <div className="flex items-center">
                <div className="relative h-6 w-6 overflow-hidden rounded-full mr-2">
                  <Image src="/placeholder.svg" alt="Shop Avatar" fill className="object-cover" />
                </div>
                <div>
                  <span className="text-sm font-medium">{reply.staff_name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{formatDate(reply.created_at)}</span>
                </div>
              </div>
              <p className="text-sm mt-2">{reply.reply_text}</p>
            </div>
          ))}
        </div>
      )}

      <Separator />
    </div>
  )
}

