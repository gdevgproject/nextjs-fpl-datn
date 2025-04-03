import { Suspense } from "react"
import { PageHeader } from "@/components/admin/common/page-header"
import { BrandDashboard } from "@/components/admin/thuong-hieu/brand-dashboard"
import { BrandListSkeleton } from "@/components/admin/thuong-hieu/brand-list-skeleton"

export default function BrandsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý thương hiệu"
        description="Quản lý thương hiệu nước hoa trong cửa hàng của bạn"
        breadcrumbs={[
          { title: "Trang chủ", href: "/admin" },
          { title: "Quản lý thương hiệu", href: "/admin/thuong-hieu" },
        ]}
        actions={[
          {
            label: "Thêm thương hiệu",
            href: "/admin/thuong-hieu/them",
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

      <Suspense fallback={<BrandListSkeleton />}>
        <BrandDashboard />
      </Suspense>
    </div>
  )
}

