import type { Metadata } from "next"
import { ProductsPage } from "@/features/products/components/products-page"

export const metadata: Metadata = {
  title: "Sản phẩm - MyBeauty",
  description: "Khám phá bộ sưu tập nước hoa chính hãng đa dạng của chúng tôi",
}

export default function SanPhamPage() {
  return <ProductsPage />
}

