import type { Metadata } from "next"
import { ProductDashboard } from "@/components/admin/bao-cao/product-dashboard"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const metadata: Metadata = {
  title: "Báo cáo sản phẩm - Admin MyBeauty",
  description: "Báo cáo sản phẩm của cửa hàng MyBeauty",
}

export default function ProductReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Trang chủ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/bao-cao">Báo cáo</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/bao-cao/san-pham">Sản phẩm</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl font-bold tracking-tight mt-2">Báo cáo sản phẩm</h1>
          <p className="text-muted-foreground">
            Phân tích hiệu suất sản phẩm, doanh thu và số lượng bán theo thời gian
          </p>
        </div>
      </div>

      <ProductDashboard />
    </div>
  )
}

