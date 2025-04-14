import { ProductManagement } from "@/features/admin/products/components/product-management"
import { AdminLayout } from "@/components/layout/backoffice/admin-layout"

export const metadata = {
  title: "Quản lý sản phẩm | MyBeauty Admin",
  description: "Quản lý sản phẩm trong cửa hàng MyBeauty",
}

export default function ProductsPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto py-6 space-y-6">
        <ProductManagement />
      </div>
    </AdminLayout>
  )
}
