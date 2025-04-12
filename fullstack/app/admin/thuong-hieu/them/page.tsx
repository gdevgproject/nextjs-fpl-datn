import { Suspense } from "react"
import { PageHeader } from "@/components/admin/common/page-header"
import { BrandFormEnhanced } from "@/components/admin/thuong-hieu/brand-form-enhanced"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AddBrandPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm thương hiệu mới"
        description="Tạo thương hiệu mới cho cửa hàng của bạn"
        breadcrumbs={[
          { title: "Trang chủ", href: "/admin" },
          { title: "Quản lý thương hiệu", href: "/admin/thuong-hieu" },
          { title: "Thêm thương hiệu mới", href: "/admin/thuong-hieu/them" },
        ]}
        actions={[
          {
            label: "Quay lại",
            href: "/admin/thuong-hieu",
            variant: "outline",
            icon: "arrowLeft",
          },
        ]}
      />

      <Suspense fallback={<FormSkeleton />}>
        <BrandFormEnhanced />
      </Suspense>
    </div>
  )
}

function FormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-48" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-64" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}

