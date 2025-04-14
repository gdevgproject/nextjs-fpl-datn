import { ProductList } from "@/features/admin/product-management/components/product-list"

export const metadata = {
  title: "Quản lý sản phẩm | Admin",
  description: "Quản lý danh sách sản phẩm",
}

export default function ProductManagementPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <ProductList />
    </div>
  )
}

