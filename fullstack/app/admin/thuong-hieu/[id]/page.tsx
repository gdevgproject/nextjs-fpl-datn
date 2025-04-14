import { Suspense } from "react"
import { PageHeader } from "@/components/admin/common/page-header"
import { BrandFormEnhanced } from "@/components/admin/thuong-hieu/brand-form-enhanced"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface EditBrandPageProps {
  params: {
    id: string
  }
}

export default function EditBrandPage({ params }: EditBrandPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Chỉnh sửa thương hiệu"
        description="Cập nhật thông tin thương hiệu"
        breadcrumbs={[
          { title: "Trang chủ", href: "/admin" },
          { title: "Quản lý thương hiệu", href: "/admin/thuong-hieu" },
          { title: "Chỉnh sửa thương hiệu", href: `/admin/thuong-hieu/${params.id}` },
        ]}
        actions={[
          {
            label: "Quay lại",
            href: "/admin/thuong-hieu",
            variant: "outline",
            icon: "arrowLeft",
          },
          {
            label: "Xem trang",
            href: "#",
            variant: "outline",
            icon: "externalLink",
            target: "_blank",
          },
        ]}
      />

      <Suspense fallback={<FormSkeleton />}>
        <BrandFormEnhanced brandId={params.id} />
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

