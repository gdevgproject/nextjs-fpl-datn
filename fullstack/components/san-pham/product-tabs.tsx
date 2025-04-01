"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductSpecifications } from "@/components/san-pham/product-specifications"
import { ProductScentPyramid } from "@/components/san-pham/product-scent-pyramid"
import { ProductReviews } from "@/components/san-pham/product-reviews"
import { ProductIngredients } from "@/components/san-pham/product-ingredients"

interface ProductTabsProps {
  product: any
  reviews: any[]
}

export function ProductTabs({ product, reviews }: ProductTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "description"

  const [activeTab, setActiveTab] = useState(tab)

  useEffect(() => {
    setActiveTab(tab)
  }, [tab])

  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Update URL without full page reload
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.push(`/san-pham/${product.slug}?${params.toString()}`, { scroll: false })
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <div className="sticky top-16 z-30 bg-background border-b pb-0.5">
        <TabsList className="w-full md:w-auto mb-0 grid grid-cols-4 md:flex md:space-x-2 h-auto">
          <TabsTrigger value="description" className="py-3">
            Mô tả
          </TabsTrigger>
          <TabsTrigger value="specifications" className="py-3">
            Thông số
          </TabsTrigger>
          <TabsTrigger value="scent" className="py-3">
            Mùi hương
          </TabsTrigger>
          <TabsTrigger value="reviews" className="py-3 relative">
            Đánh giá
            <span className="ml-1 text-xs">{`(${product.reviewCount})`}</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="description" className="pt-6">
        <div className="bg-background p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
          <p className="text-lg font-medium mb-4">{product.shortDescription}</p>
          <div className="prose prose-sm sm:prose max-w-none text-muted-foreground">
            <p className="mb-4">{product.description}</p>
            <p>
              Dior Sauvage EDP là một phiên bản nước hoa mạnh mẽ hơn so với phiên bản EDT. Nó có sự cân bằng hoàn hảo
              giữa các note hương, tạo nên một mùi hương nam tính, thanh lịch và đầy cuốn hút. Đây là lựa chọn hoàn hảo
              cho những quý ông muốn thể hiện sự tự tin và phong cách riêng của mình.
            </p>
            <h3 className="text-lg font-medium mt-6 mb-2">Đặc điểm nổi bật</h3>
            <ul>
              <li>Mùi hương nam tính, mạnh mẽ nhưng không quá nồng</li>
              <li>Độ lưu hương lâu, phù hợp cho cả ngày dài</li>
              <li>Phù hợp cho mọi mùa trong năm, đặc biệt là mùa thu và mùa đông</li>
              <li>Thiết kế chai đơn giản, sang trọng</li>
            </ul>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="specifications" className="pt-6">
        <div className="bg-background p-6 rounded-lg">
          <ProductSpecifications specifications={product.specifications} />
        </div>
      </TabsContent>

      <TabsContent value="scent" className="pt-6">
        <div className="bg-background p-6 rounded-lg">
          <ProductScentPyramid scents={product.scents} />
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Thành phần</h3>
            <ProductIngredients
              ingredients={[
                "Alcohol",
                "Aqua (Water)",
                "Parfum (Fragrance)",
                "Limonene",
                "Linalool",
                "Coumarin",
                "Citral",
                "Citronellol",
                "Geraniol",
                "Eugenol",
              ]}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="pt-6">
        <div className="bg-background p-6 rounded-lg">
          <ProductReviews
            reviews={reviews}
            rating={product.rating}
            reviewCount={product.reviewCount}
            productId={product.id}
          />
        </div>
      </TabsContent>
    </Tabs>
  )
}

