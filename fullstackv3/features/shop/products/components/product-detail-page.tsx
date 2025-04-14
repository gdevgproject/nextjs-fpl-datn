import { Suspense } from "react"
import { getProductReviews, hasUserPurchasedProduct, getRelatedProducts } from "../queries"
import { ProductGallery } from "./product-gallery"
import { ProductInfo } from "./product-info"
import { ProductVariantSelector } from "./product-variant-selector"
import { ProductReviews } from "./product-reviews"
import { ProductRelated } from "./product-related"
import { Skeleton } from "@/components/ui/skeleton"
import React from "react"

interface ProductDetailPageProps {
  product: any
  showReviewForm?: boolean
}

const MemoizedProductInfo = React.memo(ProductInfo)

export async function ProductDetailPage({ product, showReviewForm = false }: ProductDetailPageProps) {
  try {
    // Đảm bảo product tồn tại và có các thuộc tính cần thiết
    if (!product) {
      return (
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Sản phẩm không tồn tại</h1>
            <p className="text-muted-foreground">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          </div>
        </div>
      )
    }

    // Lấy đánh giá của sản phẩm
    const reviews = await getProductReviews(product.id)

    // Kiểm tra người dùng đã mua sản phẩm chưa
    const hasPurchased = await hasUserPurchasedProduct(product.id)

    // Lấy sản phẩm liên quan
    const relatedProducts = await getRelatedProducts(product.id, product.brand_id)

    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Gallery ảnh sản phẩm */}
          <Suspense fallback={<Skeleton className="aspect-square w-full rounded-lg" />}>
            <ProductGallery images={product.images || []} productName={product.name} />
          </Suspense>

          {/* Thông tin sản phẩm và chọn variant */}
          <div className="space-y-6">
            <MemoizedProductInfo product={product} />
            <ProductVariantSelector product={product} />
          </div>
        </div>

        {/* Mô tả chi tiết */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold">Mô tả sản phẩm</h2>
          <div className="mt-4 prose max-w-none dark:prose-invert">
            {product.long_description ? (
              <div dangerouslySetInnerHTML={{ __html: product.long_description }} />
            ) : (
              <p className="text-muted-foreground">Chưa có mô tả chi tiết cho sản phẩm này.</p>
            )}
          </div>
        </div>

        {/* Thông số kỹ thuật */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold">Thông số kỹ thuật</h2>
          <div className="mt-4 overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <tbody className="divide-y">
                {product.brand && (
                  <tr className="divide-x">
                    <th className="bg-muted px-4 py-3 text-left font-medium">Thương hiệu</th>
                    <td className="px-4 py-3">{product.brand.name}</td>
                  </tr>
                )}
                {product.gender && (
                  <tr className="divide-x">
                    <th className="bg-muted px-4 py-3 text-left font-medium">Giới tính</th>
                    <td className="px-4 py-3">{product.gender.name}</td>
                  </tr>
                )}
                {product.concentration && (
                  <tr className="divide-x">
                    <th className="bg-muted px-4 py-3 text-left font-medium">Nồng độ</th>
                    <td className="px-4 py-3">{product.concentration.name}</td>
                  </tr>
                )}
                {product.perfume_type && (
                  <tr className="divide-x">
                    <th className="bg-muted px-4 py-3 text-left font-medium">Loại nước hoa</th>
                    <td className="px-4 py-3">{product.perfume_type.name}</td>
                  </tr>
                )}
                {product.origin_country && (
                  <tr className="divide-x">
                    <th className="bg-muted px-4 py-3 text-left font-medium">Xuất xứ</th>
                    <td className="px-4 py-3">{product.origin_country}</td>
                  </tr>
                )}
                {product.release_year && (
                  <tr className="divide-x">
                    <th className="bg-muted px-4 py-3 text-left font-medium">Năm phát hành</th>
                    <td className="px-4 py-3">{product.release_year}</td>
                  </tr>
                )}
                {product.style && (
                  <tr className="divide-x">
                    <th className="bg-muted px-4 py-3 text-left font-medium">Phong cách</th>
                    <td className="px-4 py-3">{product.style}</td>
                  </tr>
                )}
                {product.sillage && (
                  <tr className="divide-x">
                    <th className="bg-muted px-4 py-3 text-left font-medium">Độ tỏa hương</th>
                    <td className="px-4 py-3">{product.sillage}</td>
                  </tr>
                )}
                {product.longevity && (
                  <tr className="divide-x">
                    <th className="bg-muted px-4 py-3 text-left font-medium">Độ lưu hương</th>
                    <td className="px-4 py-3">{product.longevity}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Thành phần hương */}
        {product.product_scents && product.product_scents.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold">Thành phần hương</h2>
            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Hương đầu */}
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">Hương đầu (Top Notes)</h3>
                <ul className="mt-2 space-y-1">
                  {product.product_scents
                    .filter((s: any) => s.scent_type === "top")
                    .map((s: any) => (
                      <li key={s.scent.id}>{s.scent.name}</li>
                    ))}
                  {product.product_scents.filter((s: any) => s.scent_type === "top").length === 0 && (
                    <li className="text-muted-foreground">Không có thông tin</li>
                  )}
                </ul>
              </div>

              {/* Hương giữa */}
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">Hương giữa (Middle Notes)</h3>
                <ul className="mt-2 space-y-1">
                  {product.product_scents
                    .filter((s: any) => s.scent_type === "middle")
                    .map((s: any) => (
                      <li key={s.scent.id}>{s.scent.name}</li>
                    ))}
                  {product.product_scents.filter((s: any) => s.scent_type === "middle").length === 0 && (
                    <li className="text-muted-foreground">Không có thông tin</li>
                  )}
                </ul>
              </div>

              {/* Hương cuối */}
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">Hương cuối (Base Notes)</h3>
                <ul className="mt-2 space-y-1">
                  {product.product_scents
                    .filter((s: any) => s.scent_type === "base")
                    .map((s: any) => (
                      <li key={s.scent.id}>{s.scent.name}</li>
                    ))}
                  {product.product_scents.filter((s: any) => s.scent_type === "base").length === 0 && (
                    <li className="text-muted-foreground">Không có thông tin</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Thành phần */}
        {product.product_ingredients && product.product_ingredients.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold">Thành phần</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.product_ingredients.map((i: any) => (
                <span key={i.ingredient.id} className="rounded-full bg-muted px-3 py-1 text-sm">
                  {i.ingredient.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Đánh giá sản phẩm */}
        <Suspense fallback={<Skeleton className="mt-12 h-40 w-full rounded-lg" />}>
          <ProductReviews
            reviews={reviews}
            productId={product.id}
            hasPurchased={hasPurchased}
            initialShowForm={showReviewForm}
          />
        </Suspense>

        {/* Sản phẩm liên quan */}
        <Suspense fallback={<Skeleton className="mt-12 h-60 w-full rounded-lg" />}>
          <ProductRelated products={relatedProducts} />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error("Error in ProductDetailPage:", error)
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Đã xảy ra lỗi</h1>
          <p className="text-muted-foreground">Có lỗi xảy ra khi tải trang. Vui lòng thử lại sau.</p>
        </div>
      </div>
    )
  }
}

