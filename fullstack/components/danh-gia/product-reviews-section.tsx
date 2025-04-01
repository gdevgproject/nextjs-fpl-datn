"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ReviewList } from "@/components/danh-gia/review-list"
import { ReviewFilter } from "@/components/danh-gia/review-filter"
import { Star } from "lucide-react"

interface ProductReviewsSectionProps {
  productId: number
  productName: string
  averageRating: number
  totalReviews: number
  ratingCounts: {
    rating: number
    count: number
  }[]
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
  }[]
  userHasPurchased: boolean
}

export function ProductReviewsSection({
  productId,
  productName,
  averageRating,
  totalReviews,
  ratingCounts,
  reviews,
  userHasPurchased,
}: ProductReviewsSectionProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  const filteredReviews = selectedRating ? reviews.filter((review) => review.rating === selectedRating) : reviews

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Đánh giá sản phẩm</h2>
        <p className="text-muted-foreground">Xem đánh giá của khách hàng về {productName}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 space-y-6">
          <div className="rounded-lg border p-4 text-center">
            <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex justify-center my-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(averageRating) ? "fill-amber-500 text-amber-500" : "fill-muted text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">{totalReviews} đánh giá</div>

            {userHasPurchased ? (
              <Button className="mt-4 w-full" asChild>
                <Link href={`/san-pham/danh-gia?product_id=${productId}`}>Viết đánh giá</Link>
              </Button>
            ) : (
              <div className="mt-4 text-sm text-muted-foreground">Bạn cần mua sản phẩm để đánh giá</div>
            )}
          </div>

          <ReviewFilter
            totalReviews={totalReviews}
            ratingCounts={ratingCounts}
            onFilterChange={setSelectedRating}
            selectedRating={selectedRating}
          />
        </div>

        <div className="md:w-2/3">
          <ReviewList reviews={filteredReviews} productId={productId} />
        </div>
      </div>
    </div>
  )
}

