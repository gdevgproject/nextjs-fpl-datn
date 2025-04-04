"use client"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ProductIngredientManager } from "@/components/admin/san-pham/product-ingredient-manager"

export default function ProductIngredientEnhancedPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/san-pham/them">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Thêm sản phẩm mới - Quản lý thành phần</h1>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Lưu thay đổi
        </Button>
      </div>

      <Separator />

      <ProductIngredientManager />
    </div>
  )
}

