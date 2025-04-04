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
  title: "Chỉnh sửa sản phẩm",
  description: "Chỉnh sửa thông tin sản phẩm",
}

interface EditProductPageProps {
  params: {
    id: string
  }
}

export default function EditProductPage({ params }: EditProductPageProps) {
  // Dữ liệu mẫu cho sản phẩm
  const sampleProduct = {
    id: params.id,
    name: "Dior Sauvage",
    product_code: "DIOR123",
    short_description: "Hương thơm mạnh mẽ, nam tính",
    long_description:
      "Dior Sauvage là một mùi hương nam tính, mạnh mẽ với hương gỗ và gia vị. Phù hợp cho các quý ông hiện đại, tự tin và đầy nam tính.",
    brand_id: "1",
    gender_id: "1",
    perfume_type_id: "2",
    concentration_id: "3",
    origin_country: "Pháp",
    release_year: 2015,
    style: "Hiện đại, Nam tính",
    sillage: "Mạnh",
    longevity: "Lâu (7-12 giờ)",
    status: "active",
    categories: ["1", "4"],
    images: [
      {
        id: "1",
        url: "/placeholder.svg?height=500&width=500",
        alt_text: "Dior Sauvage",
        is_main: true,
        display_order: 1,
      },
      {
        id: "2",
        url: "/placeholder.svg?height=500&width=500",
        alt_text: "Dior Sauvage Bottle",
        display_order: 2,
      },
    ],
    variants: [
      {
        id: "1",
        volume_ml: 60,
        price: 2500000,
        sale_price: 2300000,
        sku: "DIOR123-60",
        stock_quantity: 15,
      },
      {
        id: "2",
        volume_ml: 100,
        price: 3200000,
        sku: "DIOR123-100",
        stock_quantity: 10,
      },
    ],
    scents: [
      {
        id: "1",
        scent_id: "1",
        name: "Bergamot",
        type: "top",
      },
      {
        id: "2",
        scent_id: "2",
        name: "Tiêu đen",
        type: "middle",
      },
      {
        id: "3",
        scent_id: "3",
        name: "Ambroxan",
        type: "base",
      },
    ],
    ingredients: [
      {
        id: "1",
        ingredient_id: "1",
        name: "Alcohol",
      },
      {
        id: "2",
        ingredient_id: "2",
        name: "Aqua",
      },
    ],
  }

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

      <ProductFormProvider initialData={sampleProduct}>
        <ProductFormTabs isEditing>
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
              <ProductCategorySelectionAdvanced
                selectedCategories={sampleProduct.categories}
                onCategoriesChange={() => {}}
              />
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

