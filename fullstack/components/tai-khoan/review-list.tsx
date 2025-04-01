import { ReviewItem } from "@/components/tai-khoan/review-item"

interface ReviewListProps {
  reviews: {
    id: number
    product_id: number
    product_name: string
    product_image: string
    rating: number
    comment: string
    created_at: string
    is_approved: boolean
    replies: {
      id: number
      staff_name: string
      reply_text: string
      created_at: string
    }[]
  }[]
}

export function ReviewList({ reviews }: ReviewListProps) {
  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </div>
  )
}

