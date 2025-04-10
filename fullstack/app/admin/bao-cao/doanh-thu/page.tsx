import type { Metadata } from "next"
import { PageHeader } from "@/components/admin/common/page-header"
import { RevenueDashboard } from "@/components/admin/bao-cao/revenue-dashboard"

export const metadata: Metadata = {
  title: "Báo cáo doanh thu - Admin MyBeauty",
  description: "Báo cáo doanh thu chi tiết của cửa hàng MyBeauty",
}

export default function RevenueReportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        heading="Báo cáo doanh thu"
        description="Phân tích doanh thu và hiệu suất bán hàng của cửa hàng"
        breadcrumbs={[
          { title: "Trang chủ", href: "/admin" },
          { title: "Báo cáo", href: "/admin/bao-cao" },
          { title: "Doanh thu", href: "/admin/bao-cao/doanh-thu" },
        ]}
      />

      <RevenueDashboard />
    </div>
  )
}

