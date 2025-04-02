import type { Metadata } from "next"
import { CategoryFormEnhanced } from "@/components/admin/danh-muc/category-form-enhanced"
import { PageHeader } from "@/components/admin/common/page-header"

export const metadata: Metadata = {
  title: "Thêm danh mục mới - MyBeauty Admin",
  description: "Thêm danh mục sản phẩm mới cho cửa hàng MyBeauty",
}

export default function AddCategoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        heading="Thêm danh mục mới"
        description="Tạo danh mục sản phẩm mới cho cửa hàng"
        breadcrumbs={[
          { title: "Trang chủ", href: "/admin" },
          { title: "Quản lý danh mục", href: "/admin/danh-muc" },
          { title: "Thêm danh mục mới", href: "/admin/danh-muc/them" },
        ]}
      />

      <CategoryFormEnhanced />
    </div>
  )
}

