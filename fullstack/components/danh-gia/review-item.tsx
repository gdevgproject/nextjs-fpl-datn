"use client"

import Image from "next/image"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ThumbsUp, Star } from "lucide-react"

interface ReviewItemProps {
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
  }
  isHelpful: boolean
  onHelpful: () => void
}

export function ReviewItem({ review, isHelpful, onHelpful }: ReviewItemProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="relative h-10 w-10 overflow-hidden rounded-full">
          <Image src={review.avatar || "/placeholder.svg"} alt={review.user} fill className="object-cover" />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium">{review.user}</h4>
              <div className="flex items-center mt-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating ? "fill-amber-500 text-amber-500" : "fill-muted text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground ml-2">{formatDate(review.date)}</span>
                {review.verified && <span className="text-xs text-green-600 ml-2">✓ Đã mua hàng</span>}
              </div>
            </div>
          </div>

          <div className="mt-2">
            <h5 className="font-medium">{review.title}</h5>
            <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
          </div>

          <div className="mt-3 flex items-center">
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onHelpful} disabled={isHelpful}>
              <ThumbsUp className="mr-1 h-3 w-3" />
              Hữu ích <span className="ml-1">({isHelpful ? review.helpful + 1 : review.helpful})</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Shop reply (if exists) */}
      {review.id === 1 && (
        <div className="ml-14 rounded-lg bg-muted p-4">
          <div className="flex items-center">
            <div className="relative h-6 w-6 overflow-hidden rounded-full mr-2">
              <Image src="/placeholder.svg" alt="Shop Avatar" fill className="object-cover" />
            </div>
            <div>
              <span className="text-sm font-medium">MyBeauty Shop</span>
              <span className="text-xs text-muted-foreground ml-2">{formatDate(new Date().toISOString())}</span>
            </div>
          </div>
          <p className="text-sm mt-2">
            Cảm ơn bạn đã đánh giá sản phẩm của chúng tôi. Chúng tôi rất vui khi sản phẩm đã đáp ứng được nhu cầu của
            bạn. Hẹn gặp lại bạn trong những đơn hàng tiếp theo!
          </p>
        </div>
      )}

      <Separator />
    </div>
  )
}

