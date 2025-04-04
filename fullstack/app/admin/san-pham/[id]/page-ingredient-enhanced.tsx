"use client"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ProductIngredientManager } from "@/components/admin/san-pham/product-ingredient-manager"

interface ProductIngredientEnhancedPageProps {
  params: {
    id: string
  }
}

export default function ProductIngredientEnhancedPage({ params }: ProductIngredientEnhancedPageProps) {
  // Mẫu dữ liệu cho thành phần của sản phẩm
  const initialIngredients = [
    { id: "1", ingredient_id: "1", ingredient_name: "Alcohol", category: "alcohol" },
    { id: "2", ingredient_id: "2", ingredient_name: "Aqua", category: "solvents" },
    { id: "3", ingredient_id: "6", ingredient_name: "Limonene", category: "essential-oils" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/san-pham/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Chỉnh sửa sản phẩm - Quản lý thành phần</h1>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Lưu thay đổi
        </Button>
      </div>

      <Separator />

      <ProductIngredientManager productId={params.id} initialIngredients={initialIngredients} />
    </div>
  )
}

