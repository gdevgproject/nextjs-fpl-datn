import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProductFormAdvanced } from "@/components/admin/san-pham/product-form-advanced"

export const metadata: Metadata = {
  title: "Thêm sản phẩm mới - Admin MyBeauty",
  description: "Thêm sản phẩm mới vào cửa hàng MyBeauty",
}

export default function AdminAddProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/san-pham">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Thêm sản phẩm mới</h1>
        </div>
      </div>

      <ProductFormAdvanced />
    </div>
  )
}

