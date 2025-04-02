"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormDescription, FormLabel } from "@/components/ui/form"
import type { Category } from "@/types/san-pham"

interface CategoryFormProps {
  categoryId?: string
}

export function CategoryForm({ categoryId }: CategoryFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Dữ liệu mẫu cho danh mục
  const sampleCategories: Category[] = [
    {
      id: "1",
      name: "Nước hoa nam",
      slug: "nuoc-hoa-nam",
      description: "Nước hoa dành cho nam giới",
      parent_category_id: null,
      is_featured: true,
      display_order: 1,
      created_at: "2023-01-01T00:00:00Z",
    },
    {
      id: "2",
      name: "Nước hoa nữ",
      slug: "nuoc-hoa-nu",
      description: "Nước hoa dành cho nữ giới",
      parent_category_id: null,
      is_featured: true,
      display_order: 2,
      created_at: "2023-01-01T00:00:00Z",
    },
    {
      id: "3",
      name: "Nước hoa unisex",
      slug: "nuoc-hoa-unisex",
      description: "Nước hoa dành cho cả nam và nữ",
      parent_category_id: null,
      is_featured: false,
      display_order: 3,
      created_at: "2023-01-01T00:00:00Z",
    },
    {
      id: "4",
      name: "Nước hoa nam cao cấp",
      slug: "nuoc-hoa-nam-cao-cap",
      description: "Nước hoa nam cao cấp, sang trọng",
      parent_category_id: "1",
      is_featured: false,
      display_order: 1,
      created_at: "2023-01-02T00:00:00Z",
    },
  ]

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent_category_id: "",
    is_featured: false,
    display_order: 0,
  })

  useEffect(() => {
    if (categoryId) {
      // Giả lập việc lấy dữ liệu từ API
      const category = sampleCategories.find((c) => c.id === categoryId)
      if (category) {
        setFormData({
          name: category.name,
          description: category.description || "",
          parent_category_id: category.parent_category_id || "",
          is_featured: category.is_featured,
          display_order: category.display_order,
        })
      }
    }
  }, [categoryId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Giả lập việc gửi dữ liệu lên API
      console.log("Dữ liệu gửi đi:", formData)

      // Chuyển hướng về trang danh sách danh mục
      setTimeout(() => {
        router.push("/admin/danh-muc")
      }, 1000)
    } catch (error) {
      console.error("Lỗi khi lưu danh mục:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_featured: checked }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, parent_category_id: value }))
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Thông tin danh mục</CardTitle>
          <CardDescription>Nhập thông tin chi tiết cho danh mục sản phẩm</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <FormLabel htmlFor="name">Tên danh mục</FormLabel>
              <Input
                id="name"
                name="name"
                placeholder="Nhập tên danh mục"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <FormDescription>Tên hiển thị của danh mục trên website</FormDescription>
            </div>

            <div className="space-y-2">
              <FormLabel htmlFor="parent_category_id">Danh mục cha</FormLabel>
              <Select value={formData.parent_category_id} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục cha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có</SelectItem>
                  {sampleCategories
                    .filter((c) => c.id !== categoryId) // Loại bỏ danh mục hiện tại
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormDescription>Chọn danh mục cha nếu danh mục này là danh mục con</FormDescription>
            </div>

            <div className="space-y-2">
              <FormLabel htmlFor="display_order">Thứ tự hiển thị</FormLabel>
              <Input
                id="display_order"
                name="display_order"
                type="number"
                placeholder="Nhập thứ tự hiển thị"
                value={formData.display_order}
                onChange={handleChange}
                required
              />
              <FormDescription>Số nhỏ hơn sẽ hiển thị trước</FormDescription>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="is_featured" checked={formData.is_featured} onCheckedChange={handleCheckboxChange} />
                <FormLabel htmlFor="is_featured">Danh mục nổi bật</FormLabel>
              </div>
              <FormDescription>Danh mục nổi bật sẽ được hiển thị ở trang chủ</FormDescription>
            </div>
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="description">Mô tả</FormLabel>
            <Textarea
              id="description"
              name="description"
              placeholder="Nhập mô tả cho danh mục"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
            <FormDescription>Mô tả ngắn gọn về danh mục này</FormDescription>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/danh-muc")}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              "Đang lưu..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu danh mục
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

