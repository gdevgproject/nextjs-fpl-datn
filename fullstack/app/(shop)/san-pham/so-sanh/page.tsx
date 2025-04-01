import { Suspense } from "react"
import type { Metadata } from "next"
import { PageContainer } from "@/components/layout/page-container"
import { ProductCompare } from "@/components/san-pham/product-compare"
import { ProductCompareSkeleton } from "@/components/san-pham/product-compare-skeleton"

export const metadata: Metadata = {
  title: "So sánh sản phẩm",
  description: "So sánh các sản phẩm nước hoa để tìm ra lựa chọn phù hợp nhất với bạn",
}

export default function ComparePage() {
  return (
    <PageContainer>
      <div className="py-6 md:py-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">So sánh sản phẩm</h1>

        <Suspense fallback={<ProductCompareSkeleton />}>
          <ProductCompare />
        </Suspense>
      </div>
    </PageContainer>
  )
}

