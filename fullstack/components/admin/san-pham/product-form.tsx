"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductImageUpload } from "@/components/admin/san-pham/product-image-upload"
import { ProductVariantForm } from "@/components/admin/san-pham/product-variant-form"
import { ProductScentForm } from "@/components/admin/san-pham/product-scent-form"
import { ProductIngredientForm } from "@/components/admin/san-pham/product-ingredient-form"
import { ProductLabelForm } from "@/components/admin/san-pham/product-label-form"
import { ProductDeleteDialog } from "@/components/admin/san-pham/product-delete-dialog"

interface ProductFormProps {
  productId?: string
}

export function ProductForm({ productId }: ProductFormProps) {
  const isEditing = !!productId
  const [activeTab, setActiveTab] = useState("basic")

  // Dữ liệu mẫu cho các select
  const brands = [
    { id: "1", name: "Chanel" },
    { id: "2", name: "Dior" },
    { id: "3", name: "Gucci" },
    { id: "4", name: "Versace" },
    { id: "5", name: "Calvin Klein" },
  ]

  const genders = [
    { id: "1", name: "Nam" },
    { id: "2", name: "Nữ" },
    { id: "3", name: "Unisex" },
  ]

  const perfumeTypes = [
    { id: "1", name: "Eau de Parfum" },
    { id: "2", name: "Eau de Toilette" },
    { id: "3", name: "Eau de Cologne" },
    { id: "4", name: "Parfum" },
  ]

  const concentrations = [
    { id: "1", name: "Nhẹ" },
    { id: "2", name: "Vừa" },
    { id: "3", name: "Mạnh" },
  ]

  const categories = [
    { id: "1", name: "Nước hoa nam" },
    { id: "2", name: "Nước hoa nữ" },
    { id: "3", name: "Nước hoa unisex" },
    { id: "4", name: "Nước hoa mini" },
    { id: "5", name: "Gift set" },
  ]

  // Dữ liệu mẫu cho sản phẩm đang chỉnh sửa
  const sampleProduct = isEditing
    ? {
        id: "1",
        name: "Chanel No. 5",
        product_code: "CH-N5-001",
        short_description: "Một hương thơm huyền thoại, biểu tượng của sự sang trọng và thanh lịch.",
        long_description:
          "Chanel No. 5 là một trong những loại nước hoa nổi tiếng nhất thế giới. Được tạo ra vào năm 1921 bởi Ernest Beaux, đây là loại nước hoa đầu tiên mang thương hiệu Chanel và là một trong những mùi hương phổ biến nhất mọi thời đại.",
        brand_id: "1",
        gender_id: "2",
        perfume_type_id: "1",
        concentration_id: "2",
        origin_country: "Pháp",
        release_year: 1921,
        style: "Cổ điển",
        sillage: "Mạnh",
        longevity: "Lâu",
        status: "active",
        variants: [
          {
            id: "1",
            volume_ml: 50,
            price: 3200000,
            sale_price: null,
            sku: "CH-N5-50ML",
            stock_quantity: 15,
          },
          {
            id: "2",
            volume_ml: 100,
            price: 4500000,
            sale_price: 4200000,
            sku: "CH-N5-100ML",
            stock_quantity: 10,
          },
        ],
        images: [
          {
            id: "1",
            image_url: "/placeholder.svg?height=200&width=200",
            alt_text: "Chanel No. 5 Bottle",
            display_order: 1,
            is_main: true,
          },
          {
            id: "2",
            image_url: "/placeholder.svg?height=200&width=200",
            alt_text: "Chanel No. 5 Box",
            display_order: 2,
            is_main: false,
          },
        ],
        categories: ["1", "2"],
      }
    : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Xử lý submit form
    console.log("Form submitted")
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
            <TabsTrigger value="images">Hình ảnh</TabsTrigger>
            <TabsTrigger value="variants">Biến thể</TabsTrigger>
            <TabsTrigger value="scents">Hương thơm</TabsTrigger>
            <TabsTrigger value="ingredients">Thành phần</TabsTrigger>
            <TabsTrigger value="labels">Nhãn sản phẩm</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
                <CardDescription>Nhập thông tin cơ bản của sản phẩm</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên sản phẩm</Label>
                    <Input id="name" placeholder="Nhập tên sản phẩm" defaultValue={sampleProduct?.name} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product_code">Mã sản phẩm</Label>
                    <Input
                      id="product_code"
                      placeholder="Nhập mã sản phẩm"
                      defaultValue={sampleProduct?.product_code}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Thương hiệu</Label>
                    <Select defaultValue={sampleProduct?.brand_id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn thương hiệu" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Giới tính</Label>
                    <Select defaultValue={sampleProduct?.gender_id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        {genders.map((gender) => (
                          <SelectItem key={gender.id} value={gender.id}>
                            {gender.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="perfume_type">Loại nước hoa</Label>
                    <Select defaultValue={sampleProduct?.perfume_type_id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại nước hoa" />
                      </SelectTrigger>
                      <SelectContent>
                        {perfumeTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="concentration">Nồng độ</Label>
                    <Select defaultValue={sampleProduct?.concentration_id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nồng độ" />
                      </SelectTrigger>
                      <SelectContent>
                        {concentrations.map((concentration) => (
                          <SelectItem key={concentration.id} value={concentration.id}>
                            {concentration.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Mô tả ngắn</Label>
                  <Textarea
                    id="short_description"
                    placeholder="Nhập mô tả ngắn"
                    defaultValue={sampleProduct?.short_description}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="long_description">Mô tả chi tiết</Label>
                  <Textarea
                    id="long_description"
                    placeholder="Nhập mô tả chi tiết"
                    defaultValue={sampleProduct?.long_description}
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="origin_country">Xuất xứ</Label>
                    <Input
                      id="origin_country"
                      placeholder="Nhập xuất xứ"
                      defaultValue={sampleProduct?.origin_country}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="release_year">Năm phát hành</Label>
                    <Input
                      id="release_year"
                      type="number"
                      placeholder="Nhập năm phát hành"
                      defaultValue={sampleProduct?.release_year?.toString()}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="style">Phong cách</Label>
                    <Input id="style" placeholder="Nhập phong cách" defaultValue={sampleProduct?.style} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sillage">Độ tỏa hương</Label>
                    <Select defaultValue={sampleProduct?.sillage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn độ tỏa hương" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nhẹ">Nhẹ</SelectItem>
                        <SelectItem value="Vừa">Vừa</SelectItem>
                        <SelectItem value="Mạnh">Mạnh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longevity">Độ lưu hương</Label>
                    <Select defaultValue={sampleProduct?.longevity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn độ lưu hương" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ngắn">Ngắn (2-4 giờ)</SelectItem>
                        <SelectItem value="Vừa">Vừa (4-6 giờ)</SelectItem>
                        <SelectItem value="Lâu">Lâu (6-8 giờ)</SelectItem>
                        <SelectItem value="Rất lâu">Rất lâu (>8 giờ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select defaultValue={sampleProduct?.status || "active"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Còn hàng</SelectItem>
                        <SelectItem value="out_of_stock">Hết hàng</SelectItem>
                        <SelectItem value="deleted">Đã xóa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Danh mục</Label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`category-${category.id}`}
                          value={category.id}
                          defaultChecked={sampleProduct?.categories.includes(category.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <ProductImageUpload images={sampleProduct?.images || []} />
          </TabsContent>

          <TabsContent value="variants" className="space-y-6">
            <ProductVariantForm variants={sampleProduct?.variants || []} />
          </TabsContent>

          <TabsContent value="scents" className="space-y-6">
            <ProductScentForm productId={productId} />
          </TabsContent>

          <TabsContent value="ingredients" className="space-y-6">
            <ProductIngredientForm productId={productId} />
          </TabsContent>

          <TabsContent value="labels" className="space-y-6">
            <ProductLabelForm productId={productId} />
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-end space-x-4">
          <Button variant="outline" asChild>
            <Link href="/admin/san-pham">Hủy</Link>
          </Button>
          {isEditing && (
            <ProductDeleteDialog
              productId={productId || ""}
              productName={sampleProduct?.name || ""}
              productCode={sampleProduct?.product_code || ""}
            />
          )}
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? "Cập nhật" : "Lưu"} sản phẩm
          </Button>
        </div>
      </div>
    </form>
  )
}

