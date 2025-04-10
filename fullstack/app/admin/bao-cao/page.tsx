import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { PageHeader } from "@/components/admin/common/page-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, ShoppingBag, Users, Calendar } from "lucide-react"

export const metadata: Metadata = {
  title: "Báo cáo - Admin MyBeauty",
  description: "Báo cáo và thống kê của cửa hàng MyBeauty",
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        heading="Báo cáo"
        description="Xem báo cáo và thống kê của cửa hàng"
        breadcrumbs={[
          { title: "Trang chủ", href: "/admin" },
          { title: "Báo cáo", href: "/admin/bao-cao" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ReportCard
          title="Báo cáo doanh thu"
          description="Phân tích doanh thu và hiệu suất bán hàng"
          icon={TrendingUp}
          href="/admin/bao-cao/doanh-thu"
        />
        <ReportCard
          title="Báo cáo sản phẩm"
          description="Phân tích hiệu suất sản phẩm và tồn kho"
          icon={ShoppingBag}
          href="/admin/bao-cao/san-pham"
        />
        <ReportCard
          title="Báo cáo khách hàng"
          description="Phân tích khách hàng và hành vi mua hàng"
          icon={Users}
          href="/admin/bao-cao/khach-hang"
        />
        <ReportCard
          title="Báo cáo theo thời gian"
          description="Phân tích xu hướng theo thời gian"
          icon={Calendar}
          href="/admin/bao-cao/thoi-gian"
        />
      </div>
    </div>
  )
}

interface ReportCardProps {
  title: string
  description: string
  icon: React.ElementType
  href: string
}

function ReportCard({ title, description, icon: Icon, href }: ReportCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 p-1.5">
          <Icon className="h-full w-full text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter className="pt-0">
        <Link href={href} className="text-sm text-primary hover:underline">
          Xem báo cáo
        </Link>
      </CardFooter>
    </Card>
  )
}

