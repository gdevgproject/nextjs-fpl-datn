"use client"

import Image from "next/image"
import { formatDate } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { EnhancedStarRating } from "@/components/danh-gia/enhanced-star-rating"
import { ThumbsUp, ThumbsDown } from "lucide-react"

interface ReviewPreviewProps {
  review: {
    title: string
    rating: number
    comment: string
    recommend: boolean
    images?: string[]
  }
  product: {
    name: string
    brand: string
  }
}

export function ReviewPreview({ review, product }: ReviewPreviewProps) {
  const currentDate = new Date().toISOString()

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Xem trước đánh giá của bạn</h3>
              <p className="text-sm text-muted-foreground">
                {product.brand} - {product.name}
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">{formatDate(currentDate)}</div>
          </div>

          <div>
            <EnhancedStarRating value={review.rating} onChange={() => {}} readOnly />
            <h4 className="mt-2 font-medium">{review.title}</h4>
            <p className="mt-1 whitespace-pre-wrap text-sm">{review.comment}</p>
          </div>

          {review.recommend !== undefined && (
            <div className="flex items-center text-sm">
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

          {review.images && review.images.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">Hình ảnh đính kèm:</p>
              <div className="flex flex-wrap gap-2">
                {review.images.map((url, index) => (
                  <div key={index} className="relative h-20 w-20 overflow-hidden rounded-md">
                    <Image
                      src={url || "/placeholder.svg"}
                      alt={`Review image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-md bg-muted p-4 text-sm">
            <p className="font-medium">Lưu ý:</p>
            <p className="mt-1">
              Đây chỉ là bản xem trước. Đánh giá của bạn sẽ được kiểm duyệt trước khi hiển thị công khai.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

