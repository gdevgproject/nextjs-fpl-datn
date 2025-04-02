"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, Trash2, Eye, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { CategorySlugPreview } from "@/components/admin/danh-muc/category-slug-preview"
import { CategoryDeleteDialog } from "@/components/admin/danh-muc/category-delete-dialog"
import { CategoryPreview } from "@/components/admin/danh-muc/category-preview"
import { CategoryProductsTable } from "@/components/admin/danh-muc/category-products-table"
import type { Category } from "@/types/san-pham"

interface CategoryFormEnhancedProps {
  categoryId?: string
}

export function CategoryFormEnhanced({ categoryId }: CategoryFormEnhancedProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

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
    meta_title: "",
    meta_description: "",
    slug: "",
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
          meta_title: category.name,
          meta_description: category.description || "",
          slug: category.slug,
        })
      }
    }
  }, [categoryId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Giả lập việc gửi dữ liệu lên API
      await new Promise((resolve) => setTimeout(resolve, 800))

      toast.success(
        categoryId
          ? `Đã cập nhật danh mục "${formData.name}" thành công`
          : `Đã tạo danh mục "${formData.name}" thành công`,
      )

      // Chuyển hướng về trang danh sách danh mục
      router.push("/admin/danh-muc")
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu danh mục")
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

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/đ/g, "d")
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
  }

  useEffect(() => {
    if (!categoryId && formData.name) {
      const slug = generateSlug(formData.name)
      setFormData((prev) => ({ ...prev, slug }))
    }
  }, [formData.name, categoryId])

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => router.push("/admin/danh-muc")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>

        <div className="flex items-center space-x-2">
          {categoryId && (
            <>
              <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
                <Eye className="mr-2 h-4 w-4" />
                Xem trước
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </Button>
            </>
          )}
          <Button type="submit" form="category-form" disabled={isLoading}>
            {isLoading ? (
              "Đang lưu..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu danh mục
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="general">Thông tin chung</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              {categoryId && <TabsTrigger value="products">Sản phẩm</TabsTrigger>}
            </TabsList>

            <form id="category-form" onSubmit={handleSubmit}>
              <Card>
                <TabsContent value="general" className="m-0">
                  <CardHeader>
                    <CardTitle>Thông tin danh mục</CardTitle>
                    <CardDescription>Nhập thông tin chi tiết cho danh mục sản phẩm</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Tên danh mục <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Nhập tên danh mục"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                        <p className="text-sm text-muted-foreground">Tên hiển thị của danh mục trên website</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="parent_category_id">Danh mục cha</Label>
                        <Select value={formData.parent_category_id} onValueChange={handleSelectChange}>
                          <SelectTrigger id="parent_category_id">
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
                        <p className="text-sm text-muted-foreground">
                          Chọn danh mục cha nếu danh mục này là danh mục con
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="display_order">
                          Thứ tự hiển thị <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="display_order"
                          name="display_order"
                          type="number"
                          placeholder="Nhập thứ tự hiển thị"
                          value={formData.display_order}
                          onChange={handleChange}
                          required
                        />
                        <p className="text-sm text-muted-foreground">Số nhỏ hơn sẽ hiển thị trước</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 pt-6">
                          <Checkbox
                            id="is_featured"
                            checked={formData.is_featured}
                            onCheckedChange={handleCheckboxChange}
                          />
                          <Label htmlFor="is_featured">Danh mục nổi bật</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">Danh mục nổi bật sẽ được hiển thị ở trang chủ</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Mô tả</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Nhập mô tả cho danh mục"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                      />
                      <p className="text-sm text-muted-foreground">Mô tả ngắn gọn về danh mục này</p>
                    </div>
                  </CardContent>
                </TabsContent>

                <TabsContent value="seo" className="m-0">
                  <CardHeader>
                    <CardTitle>Thông tin SEO</CardTitle>
                    <CardDescription>Tối ưu hóa danh mục cho công cụ tìm kiếm</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="slug">
                        Slug URL <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex space-x-2">
                        <Input
                          id="slug"
                          name="slug"
                          placeholder="nhap-slug-url"
                          value={formData.slug}
                          onChange={handleChange}
                          required
                        />
                        {!categoryId && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFormData((prev) => ({ ...prev, slug: generateSlug(formData.name) }))}
                          >
                            Tạo tự động
                          </Button>
                        )}
                      </div>
                      <CategorySlugPreview slug={formData.slug} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meta_title">Tiêu đề SEO</Label>
                      <Input
                        id="meta_title"
                        name="meta_title"
                        placeholder="Nhập tiêu đề SEO"
                        value={formData.meta_title}
                        onChange={handleChange}
                      />
                      <p className="text-sm text-muted-foreground">Tiêu đề hiển thị trên kết quả tìm kiếm Google</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meta_description">Mô tả SEO</Label>
                      <Textarea
                        id="meta_description"
                        name="meta_description"
                        placeholder="Nhập mô tả SEO"
                        value={formData.meta_description}
                        onChange={handleChange}
                        rows={3}
                      />
                      <p className="text-sm text-muted-foreground">Mô tả hiển thị trên kết quả tìm kiếm Google</p>
                    </div>
                  </CardContent>
                </TabsContent>

                {categoryId && (
                  <TabsContent value="products" className="m-0">
                    <CardHeader>
                      <CardTitle>Sản phẩm trong danh mục</CardTitle>
                      <CardDescription>Quản lý sản phẩm thuộc danh mục này</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CategoryProductsTable categoryId={categoryId} />
                    </CardContent>
                  </TabsContent>
                )}

                <CardFooter className="flex justify-between border-t p-6">
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
              </Card>
            </form>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin bổ sung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryId && (
                <>
                  <div className="space-y-1">
                    <Label>ID danh mục</Label>
                    <div className="text-sm font-medium">{categoryId}</div>
                  </div>

                  <div className="space-y-1">
                    <Label>Ngày tạo</Label>
                    <div className="text-sm">
                      {new Date(sampleCategories.find((c) => c.id === categoryId)?.created_at || "").toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-1">
                    <Label>Số lượng sản phẩm</Label>
                    <div className="text-sm font-medium">
                      {categoryId === "1"
                        ? 15
                        : categoryId === "2"
                          ? 20
                          : categoryId === "3"
                            ? 10
                            : categoryId === "4"
                              ? 8
                              : 0}{" "}
                      sản phẩm
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <Label>Trạng thái</Label>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Đang hoạt động</span>
                </div>
              </div>

              {!categoryId && (
                <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                    <p>Sau khi tạo danh mục, bạn có thể thêm sản phẩm vào danh mục này.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CategoryDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        category={
          categoryId
            ? {
                id: categoryId,
                name: formData.name,
                productCount:
                  categoryId === "1"
                    ? 15
                    : categoryId === "2"
                      ? 20
                      : categoryId === "3"
                        ? 10
                        : categoryId === "4"
                          ? 8
                          : 0,
                hasChildren: categoryId === "1" || categoryId === "2",
              }
            : null
        }
      />

      <CategoryPreview
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        category={{
          id: categoryId || "new",
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          is_featured: formData.is_featured,
          display_order: formData.display_order,
          parent_category_id: formData.parent_category_id,
          created_at: new Date().toISOString(),
        }}
      />
    </>
  )
}

