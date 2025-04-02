import type { Metadata } from "next"
import { CategoryDashboard } from "@/components/admin/danh-muc/category-dashboard"
import { PageHeader } from "@/components/admin/common/page-header"

export const metadata: Metadata = {
  title: "Quản lý danh mục - MyBeauty Admin",
  description: "Quản lý danh mục sản phẩm của cửa hàng MyBeauty",
}

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        heading="Quản lý danh mục"
        description="Quản lý danh mục sản phẩm của cửa hàng"
        breadcrumbs={[
          { title: "Trang chủ", href: "/admin" },
          { title: "Quản lý danh mục", href: "/admin/danh-muc" },
        ]}
        actions={[
          {
            label: "Thêm danh mục",
            href: "/admin/danh-muc/them",
            variant: "default",
            icon: "plus",
          },
          {
            label: "Nhập Excel",
            variant: "outline",
            icon: "upload",
            onClick: () => {},
          },
          {
            label: "Xuất Excel",
            variant: "outline",
            icon: "download",
            onClick: () => {},
          },
        ]}
      />

      <CategoryDashboard />
    </div>
  )
}

