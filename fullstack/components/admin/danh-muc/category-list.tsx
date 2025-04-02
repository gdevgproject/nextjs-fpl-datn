"use client"

import { useState } from "react"
import Link from "next/link"
import { Edit, Trash2, ChevronDown, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CategoryTree } from "@/components/admin/danh-muc/category-tree"
import { CategoryDeleteDialog } from "@/components/admin/danh-muc/category-delete-dialog"
import type { Category } from "@/types/san-pham"

export function CategoryList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "tree">("list")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<
    (Category & { productCount?: number; hasChildren?: boolean }) | null
  >(null)

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
    {
      id: "5",
      name: "Nước hoa nam thể thao",
      slug: "nuoc-hoa-nam-the-thao",
      description: "Nước hoa nam hương thể thao, năng động",
      parent_category_id: "1",
      is_featured: false,
      display_order: 2,
      created_at: "2023-01-02T00:00:00Z",
    },
    {
      id: "6",
      name: "Nước hoa nữ cao cấp",
      slug: "nuoc-hoa-nu-cao-cap",
      description: "Nước hoa nữ cao cấp, sang trọng",
      parent_category_id: "2",
      is_featured: true,
      display_order: 1,
      created_at: "2023-01-02T00:00:00Z",
    },
  ]

  // Dữ liệu mẫu cho số lượng sản phẩm trong mỗi danh mục
  const categoryProductCounts: Record<string, number> = {
    "1": 15,
    "2": 20,
    "3": 10,
    "4": 8,
    "5": 7,
    "6": 12,
  }

  const filteredCategories = sampleCategories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const rootCategories = sampleCategories.filter((category) => category.parent_category_id === null)

  const handleDeleteClick = (category: Category) => {
    // Kiểm tra xem danh mục có danh mục con không
    const hasChildren = sampleCategories.some((c) => c.parent_category_id === category.id)

    // Lấy số lượng sản phẩm trong danh mục
    const productCount = categoryProductCounts[category.id] || 0

    setCategoryToDelete({
      ...category,
      productCount,
      hasChildren,
    })
    setIsDeleteDialogOpen(true)
  }

  const getCategoryParentName = (parentId: string | null) => {
    if (!parentId) return "Không có"
    const parent = sampleCategories.find((c) => c.id === parentId)
    return parent ? parent.name : "Không có"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Danh sách danh mục</CardTitle>
            <CardDescription>Quản lý danh mục sản phẩm của cửa hàng</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              Danh sách
            </Button>
            <Button variant={viewMode === "tree" ? "default" : "outline"} size="sm" onClick={() => setViewMode("tree")}>
              Cây danh mục
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {viewMode === "list" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead>Danh mục cha</TableHead>
                  <TableHead>Thứ tự hiển thị</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{getCategoryParentName(category.parent_category_id)}</TableCell>
                    <TableCell>{category.display_order}</TableCell>
                    <TableCell>
                      {category.is_featured ? (
                        <Badge variant="default">Nổi bật</Badge>
                      ) : (
                        <Badge variant="outline">Bình thường</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/admin/danh-muc/${category.id}`}>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/danh-muc/${category.slug}`} target="_blank">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem trang
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(category)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <CategoryTree categories={sampleCategories} onDelete={handleDeleteClick} />
          )}
        </div>
      </CardContent>

      <CategoryDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        category={categoryToDelete}
      />
    </Card>
  )
}

