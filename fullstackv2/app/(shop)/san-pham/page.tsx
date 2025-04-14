import ProductListPage from "@/features/shop/plp/components/product-list-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sản phẩm | MyBeauty",
  description: "Khám phá bộ sưu tập nước hoa đa dạng của chúng tôi với các thương hiệu cao cấp và mùi hương độc đáo.",
}

export default function ProductsPage() {
  return <ProductListPage />
}
