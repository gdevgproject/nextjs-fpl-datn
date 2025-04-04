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
  title: "Thêm sản phẩm mới | MyBeauty Admin",
  description: "Thêm sản phẩm mới vào cửa hàng",
}

// Dữ liệu mẫu cho validation
const sampleValidationErrors = [
  {
    field: "Tên sản phẩm",
    message: "Tên sản phẩm không được để trống",
    severity: "error",
    tab: "Thông tin cơ bản",
    section: "Thông tin chung",
  },
  {
    field: "Mã sản phẩm",
    message: "Mã sản phẩm không được để trống",
    severity: "error",
    tab: "Thông tin cơ bản",
    section: "Thông tin chung",
  },
  {
    field: "Mô tả ngắn",
    message: "Mô tả ngắn không được để trống",
    severity: "warning",
    tab: "Thông tin cơ bản",
    section: "Mô tả",
  },
  {
    field: "Hình ảnh",
    message: "Sản phẩm cần ít nhất 1 hình ảnh",
    severity: "error",
    tab: "Hình ảnh",
    section: "Hình ảnh sản phẩm",
  },
  {
    field: "Biến thể",
    message: "Sản phẩm cần ít nhất 1 biến thể",
    severity: "error",
    tab: "Biến thể",
    section: "Biến thể sản phẩm",
  },
  {
    field: "Danh mục",
    message: "Sản phẩm cần ít nhất 1 danh mục",
    severity: "warning",
    tab: "Danh mục",
    section: "Danh mục sản phẩm",
  },
]

const sampleValidationSummary = {
  errors: 4,
  warnings: 2,
  completionPercentage: 35,
  sections: {
    "Thông tin chung": {
      completionPercentage: 40,
      errors: 2,
      warnings: 0,
    },
    "Mô tả": {
      completionPercentage: 60,
      errors: 0,
      warnings: 1,
    },
    "Hình ảnh sản phẩm": {
      completionPercentage: 0,
      errors: 1,
      warnings: 0,
    },
    "Biến thể sản phẩm": {
      completionPercentage: 0,
      errors: 1,
      warnings: 0,
    },
    "Danh mục sản phẩm": {
      completionPercentage: 50,
      errors: 0,
      warnings: 1,
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

export default function AddProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thêm sản phẩm mới</h1>
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/admin" },
              { label: "Sản phẩm", href: "/admin/san-pham" },
              { label: "Thêm sản phẩm mới", href: "/admin/san-pham/them" },
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
                  <CardTitle>Thêm sản phẩm mới</CardTitle>
                  <CardDescription>Điền thông tin sản phẩm mới</CardDescription>
                </div>
                <ProductFormProgress
                  progress={sampleValidationSummary.completionPercentage}
                  errors={sampleValidationSummary.errors}
                  warnings={sampleValidationSummary.warnings}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ProductFormSaveStatus lastSaved={null} isDirty={true} />
              <Separator className="my-4" />
              <ProductFormAdvanced />
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

