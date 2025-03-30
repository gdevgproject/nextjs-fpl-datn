import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ReviewFormSkeleton } from "@/components/danh-gia/review-form-skeleton"
import { WriteReviewClient } from "./write-review-client"

export const metadata: Metadata = {
  title: "Viết đánh giá sản phẩm | MyBeauty",
  description: "Chia sẻ trải nghiệm của bạn về sản phẩm",
}

interface WriteReviewPageProps {
  searchParams: {
    product_id?: string
    order_id?: string
  }
}

export default function WriteReviewPage({ searchParams }: WriteReviewPageProps) {
  const productId = searchParams.product_id ? Number.parseInt(searchParams.product_id) : undefined
  const orderId = searchParams.order_id ? Number.parseInt(searchParams.order_id) : undefined

  return (
    <div className="container py-6 md:py-10">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Trang chủ</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/tai-khoan/don-hang">Đơn hàng của tôi</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink>Viết đánh giá</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold md:text-3xl">Viết đánh giá sản phẩm</h1>

        <Suspense fallback={<ReviewFormSkeleton />}>
          <WriteReviewClient productId={productId} orderId={orderId} />
        </Suspense>
      </div>
    </div>
  )
}

