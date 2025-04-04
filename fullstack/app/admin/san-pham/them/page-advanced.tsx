import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProductFormProvider } from "@/components/admin/san-pham/product-form-context"
import { ProductFormTabs } from "@/components/admin/san-pham/product-form-tabs"
import { ProductBasicInfoForm } from "@/components/admin/san-pham/product-basic-info-form"
import { ProductImageUploadAdvanced } from "@/components/admin/san-pham/product-image-upload-advanced"
import { ProductCategorySelectionAdvanced } from "@/components/admin/san-pham/product-category-selection-advanced"
import { ProductVariantForm } from "@/components/admin/san-pham/product-variant-form"
import { ProductScentForm } from "@/components/admin/san-pham/product-scent-form"
import { ProductIngredientForm } from "@/components/admin/san-pham/product-ingredient-form"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Tabs, TabsContent } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Thêm sản phẩm mới",
  description: "Thêm sản phẩm mới vào cửa hàng",
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

      <ProductFormProvider>
        <ProductFormTabs>
          <Tabs defaultValue="basic" className="w-full">
            <TabsContent value="basic" className="m-0">
              <ProductBasicInfoForm />
            </TabsContent>
            <TabsContent value="images" className="m-0">
              <ProductImageUploadAdvanced />
            </TabsContent>
            <TabsContent value="variants" className="m-0">
              <ProductVariantForm />
            </TabsContent>
            <TabsContent value="categories" className="m-0">
              <ProductCategorySelectionAdvanced selectedCategories={[]} onCategoriesChange={() => {}} />
            </TabsContent>
            <TabsContent value="scents" className="m-0">
              <ProductScentForm />
            </TabsContent>
            <TabsContent value="ingredients" className="m-0">
              <ProductIngredientForm />
            </TabsContent>
          </Tabs>
        </ProductFormTabs>
      </ProductFormProvider>
    </div>
  )
}

