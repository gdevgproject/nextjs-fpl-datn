"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ProductVariantManager } from "@/components/admin/san-pham/product-variant-manager"

interface EditProductVariantEnhancedPageProps {
  params: {
    id: string
  }
}

export default function EditProductVariantEnhancedPage({ params }: EditProductVariantEnhancedPageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("variants")

  // Giả lập dữ liệu sản phẩm
  const productName = "Chanel No. 5"

  // Giả lập dữ liệu biến thể
  const initialVariants = [
    {
      id: "1",
      volume_ml: 50,
      price: 2500000,
      sale_price: null,
      sku: "CHANEL-50ML",
      stock_quantity: 25,
      is_default: true,
    },
    {
      id: "2",
      volume_ml: 100,
      price: 4500000,
      sale_price: 3800000,
      sku: "CHANEL-100ML",
      stock_quantity: 15,
    },
    {
      id: "3",
      volume_ml: 200,
      price: 8000000,
      sale_price: null,
      sku: "CHANEL-200ML",
      stock_quantity: 5,
    },
    {
      id: "4",
      volume_ml: 30,
      price: 1800000,
      sale_price: null,
      sku: "CHANEL-30ML",
      stock_quantity: 0,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/san-pham">Sản phẩm</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Chỉnh sửa: {productName}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Lưu thay đổi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Chỉnh sửa sản phẩm: {productName}</CardTitle>
            <CardDescription>Quản lý thông tin chi tiết cho sản phẩm</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                  value="basic"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                >
                  Thông tin cơ bản
                </TabsTrigger>
                <TabsTrigger
                  value="variants"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                >
                  Biến thể
                </TabsTrigger>
                <TabsTrigger
                  value="images"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                >
                  Hình ảnh
                </TabsTrigger>
                <TabsTrigger
                  value="categories"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                >
                  Danh mục
                </TabsTrigger>
                <TabsTrigger
                  value="scents"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                >
                  Hương thơm
                </TabsTrigger>
              </TabsList>
              <div className="p-6">
                <TabsContent value="basic">
                  <div className="text-center py-8 text-muted-foreground">Thông tin cơ bản của sản phẩm</div>
                </TabsContent>
                <TabsContent value="variants">
                  <ProductVariantManager
                    productId={params.id}
                    productName={productName}
                    initialVariants={initialVariants}
                  />
                </TabsContent>
                <TabsContent value="images">
                  <div className="text-center py-8 text-muted-foreground">Quản lý hình ảnh sản phẩm</div>
                </TabsContent>
                <TabsContent value="categories">
                  <div className="text-center py-8 text-muted-foreground">Chọn danh mục cho sản phẩm</div>
                </TabsContent>
                <TabsContent value="scents">
                  <div className="text-center py-8 text-muted-foreground">Thêm thông tin hương thơm</div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

