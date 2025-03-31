import { Suspense } from "react"
import type { Metadata } from "next"
import { UserReviewsClient } from "./user-reviews-client"
import { UserReviewsSkeleton } from "@/components/tai-khoan/user-reviews-skeleton"

export const metadata: Metadata = {
  title: "Đánh giá của tôi | MyBeauty",
  description: "Quản lý đánh giá sản phẩm của bạn",
}

export default function UserReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Đánh giá của tôi</h1>
        <p className="text-muted-foreground">Quản lý và theo dõi các đánh giá sản phẩm bạn đã viết</p>
      </div>

      <Suspense fallback={<UserReviewsSkeleton />}>
        <UserReviewsClient />
      </Suspense>
    </div>
  )
}

