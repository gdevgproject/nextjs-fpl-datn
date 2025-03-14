import type { Metadata } from "next"
import { Suspense } from "react"
import { Breadcrumb } from "@/components/ui/Breadcrumb"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import ProductGallery from "@/features/product/components/ProductGallery"
import ProductInfo from "@/features/product/components/ProductInfo"
import ProductTabs from "@/features/product/components/ProductTabs"
import RelatedProducts from "@/features/product/components/RelatedProducts"
import ProductReviews from "@/features/product/components/ProductReviews"
import ProductFAQ from "@/features/product/components/ProductFAQ"
import ProductQA from "@/features/product/components/ProductQA"
import { mockProduct, mockRelatedProducts } from "@/features/product/mocks/productMockData"
import { generateMetadata as generateSeoMetadata } from "@/utils/seo"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // In production, fetch this data from API
  const product = mockProduct

  return generateSeoMetadata({
    title: product.name,
    description: product.description.replace(/<[^>]*>/g, "").slice(0, 160),
    keywords: product.tags,
    image: product.images[0].url,
  })
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  // In production, fetch this data from API
  const product = mockProduct

  return (
    <div className="min-h-screen bg-background pb-8 sm:pb-12 pt-4 sm:pt-6">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <Breadcrumb
            items={[
              { label: "Trang Chủ", href: "/" },
              { label: "Sản Phẩm", href: "/products" },
              { label: product.category?.name || "Danh Mục", href: `/products/category/${product.category?.slug}` },
              { label: product.name },
            ]}
          />
        </nav>

        {/* Product Detail Section */}
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Column - Product Gallery */}
          <div>
            <ProductGallery images={product.images} />
          </div>

          {/* Right Column - Product Info */}
          <div>
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Product Tabs Section */}
        <section className="mt-12">
          <ProductTabs product={product} />
        </section>

        {/* FAQ Section */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-grayscale-90 mb-6">Câu hỏi thường gặp</h2>
          <ProductFAQ />
        </section>

        {/* Related Products Section */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-grayscale-90 mb-6">Sản phẩm liên quan</h2>
          <Suspense fallback={<LoadingSpinner />}>
            <RelatedProducts products={mockRelatedProducts} />
          </Suspense>
        </section>

        {/* Reviews Section */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-grayscale-90 mb-6">Đánh giá sản phẩm</h2>
          <Suspense fallback={<LoadingSpinner />}>
            <ProductReviews productId={product.id} />
          </Suspense>
        </section>

        {/* Q&A Section */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-grayscale-90 mb-6">Hỏi đáp</h2>
          <Suspense fallback={<LoadingSpinner />}>
            <ProductQA productId={product.id} />
          </Suspense>
        </section>
      </div>
    </div>
  )
}

