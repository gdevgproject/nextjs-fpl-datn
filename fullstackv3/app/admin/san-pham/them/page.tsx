import type { Metadata } from "next"
import { ProductForm } from "@/features/admin/product-management/components/product-form"

export const metadata: Metadata = {
  title: "Thêm sản phẩm mới | Admin",
  description: "Thêm sản phẩm mới vào hệ thống",
}

export default function AddProductPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <ProductForm />
    </div>
  )
}

