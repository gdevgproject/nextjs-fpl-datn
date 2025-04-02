import type { Metadata } from "next"
import { CategoryFormEnhanced } from "@/components/admin/danh-muc/category-form-enhanced"
import { PageHeader } from "@/components/admin/common/page-header"

interface EditCategoryPageProps {
  params: {
    id: string
  }
}

export const metadata: Metadata = {
  title: "Chỉnh sửa danh mục - MyBeauty Admin",
  description: "Chỉnh sửa danh mục sản phẩm của cửa hàng MyBeauty",
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        heading="Chỉnh sửa danh mục"
        description="Cập nhật thông tin danh mục sản phẩm"
        breadcrumbs={[
          { title: "Trang chủ", href: "/admin" },
          { title: "Quản lý danh mục", href: "/admin/danh-muc" },
          { title: "Chỉnh sửa danh mục", href: `/admin/danh-muc/${params.id}` },
        ]}
      />

      <CategoryFormEnhanced categoryId={params.id} />
    </div>
  )
}

