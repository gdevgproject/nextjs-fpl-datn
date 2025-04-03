import type { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import { ProductLabelDashboard } from "@/components/admin/thuoc-tinh/product-label-dashboard"
import { PageHeader } from "@/components/admin/common/page-header"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { HomeIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "Quản lý nhãn sản phẩm | MyBeauty Admin",
  description: "Quản lý các nhãn sản phẩm như mới, bán chạy, giảm giá, v.v.",
}

export default function ProductLabelsPage() {
  return (
    <div className="flex flex-col space-y-6 p-6">
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">
              <HomeIcon className="h-4 w-4 mr-1" />
              Trang chủ
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/thuoc-tinh">Thuộc tính</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/thuoc-tinh/nhan-san-pham">Nhãn sản phẩm</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Quản lý nhãn sản phẩm"
        description="Quản lý các nhãn sản phẩm như mới, bán chạy, giảm giá, v.v."
      />
      <Separator />

      <ProductLabelDashboard />
    </div>
  )
}

