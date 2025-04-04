import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProductFormAdvanced } from "@/components/admin/san-pham/product-form-advanced"

export const metadata: Metadata = {
  title: "Chỉnh sửa sản phẩm - Admin MyBeauty",
  description: "Chỉnh sửa thông tin sản phẩm trong cửa hàng MyBeauty",
}

export default function AdminEditProductPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/san-pham">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa sản phẩm</h1>
        </div>
      </div>

      <ProductFormAdvanced productId={params.id} />
    </div>
  )
}

