import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductFormAdvanced } from "@/components/admin/san-pham/product-form-advanced"
import { ProductFormValidation } from "@/components/admin/san-pham/product-form-validation"
import { ProductFormSaveStatus } from "@/components/admin/san-pham/product-form-save-status"
import { ProductFormProgress } from "@/components/admin/san-pham/product-form-progress"
import { Breadcrumb } from "@/components/ui/breadcrumb"

export const metadata: Metadata = {
  title: "Chỉnh sửa sản phẩm | MyBeauty Admin",
  description: "Chỉnh sửa thông tin sản phẩm",
}

interface EditProductPageProps {
  params: {
    id: string
  }
}

// Dữ liệu mẫu cho validation
const sampleValidationErrors = [
  {
    field: "Mô tả chi tiết",
    message: "Mô tả chi tiết quá ngắn, nên có ít nhất 100 ký tự",
    severity: "warning",
    tab: "Thông tin cơ bản",
    section: "Mô tả",
  },
  {
    field: "Hình ảnh",
    message: "Nên có ít nhất 3 hình ảnh cho sản phẩm",
    severity: "warning",
    tab: "Hình ảnh",
    section: "Hình ảnh sản phẩm",
  },
]

const sampleValidationSummary = {
  errors: 0,
  warnings: 2,
  completionPercentage: 85,
  sections: {
    "Thông tin chung": {
      completionPercentage: 100,
      errors: 0,
      warnings: 0,
    },
    "Mô tả": {
      completionPercentage: 80,
      errors: 0,
      warnings: 1,
    },
    "Hình ảnh sản phẩm": {
      completionPercentage: 70,
      errors: 0,
      warnings: 1,
    },
    "Biến thể sản phẩm": {
      completionPercentage: 100,
      errors: 0,
      warnings: 0,
    },
    "Danh mục sản phẩm": {
      completionPercentage: 100,
      errors: 0,
      warnings: 0,
    },
    "Hương thơm": {
      completionPercentage: 70,
      errors: 0,
      warnings: 0,
    },
    "Thành phần": {
      completionPercentage: 80,
      errors: 0,
      warnings: 0,
    },
  },
}

export default function EditProductPage({ params }: EditProductPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa sản phẩm</h1>
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/admin" },
              { label: "Sản phẩm", href: "/admin/san-pham" },
              { label: "Chỉnh sửa sản phẩm", href: `/admin/san-pham/${params.id}` },
            ]}
          />
        </div>
        <Link href="/admin/san-pham">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Chỉnh sửa sản phẩm</CardTitle>
                  <CardDescription>Cập nhật thông tin sản phẩm</CardDescription>
                </div>
                <ProductFormProgress
                  progress={sampleValidationSummary.completionPercentage}
                  errors={sampleValidationSummary.errors}
                  warnings={sampleValidationSummary.warnings}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ProductFormSaveStatus lastSaved={new Date()} isDirty={false} />
              <Separator className="my-4" />
              <ProductFormAdvanced productId={params.id} />
            </CardContent>
          </Card>
        </div>

        <div className="md:w-1/3">
          <ProductFormValidation errors={sampleValidationErrors} summary={sampleValidationSummary} />
        </div>
      </div>
    </div>
  )
}

