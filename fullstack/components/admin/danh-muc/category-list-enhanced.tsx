"use client"

import { useState } from "react"
import Link from "next/link"
import { Edit, Trash2, Eye, MoreHorizontal, ArrowUp, ArrowDown, Copy } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CategoryTree } from "@/components/admin/danh-muc/category-tree-enhanced"
import { CategoryDeleteDialog } from "@/components/admin/danh-muc/category-delete-dialog"
import { CategoryMoveDialog } from "@/components/admin/danh-muc/category-move-dialog"
import { CategoryDuplicateDialog } from "@/components/admin/danh-muc/category-duplicate-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import type { Category } from "@/types/san-pham"

interface CategoryListEnhancedProps {
  viewMode: "list" | "tree"
  filters: {
    search: string
    status: string
    featured: string
    parentCategory: string
  }
}

export function CategoryListEnhanced({ viewMode, filters }: CategoryListEnhancedProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false)
  const [categoryToAction, setCategoryToAction] = useState<
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

  // Lọc danh mục theo bộ lọc
  const filteredCategories = sampleCategories.filter((category) => {
    // Lọc theo tìm kiếm
    if (filters.search && !category.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }

    // Lọc theo danh mục nổi bật
    if (filters.featured === "featured" && !category.is_featured) {
      return false
    }
    if (filters.featured === "not-featured" && category.is_featured) {
      return false
    }

    // Lọc theo danh mục cha
    if (filters.parentCategory === "none" && category.parent_category_id !== null) {
      return false
    }
    if (
      filters.parentCategory !== "all" &&
      filters.parentCategory !== "none" &&
      category.parent_category_id !== filters.parentCategory
    ) {
      return false
    }

    return true
  })

  const handleDeleteClick = (category: Category) => {
    // Kiểm tra xem danh mục có danh mục con không
    const hasChildren = sampleCategories.some((c) => c.parent_category_id === category.id)

    // Lấy số lượng sản phẩm trong danh mục
    const productCount = categoryProductCounts[category.id] || 0

    setCategoryToAction({
      ...category,
      productCount,
      hasChildren,
    })
    setIsDeleteDialogOpen(true)
  }

  const handleMoveClick = (category: Category) => {
    setCategoryToAction(category)
    setIsMoveDialogOpen(true)
  }

  const handleDuplicateClick = (category: Category) => {
    setCategoryToAction(category)
    setIsDuplicateDialogOpen(true)
  }

  const getCategoryParentName = (parentId: string | null) => {
    if (!parentId) return "Không có"
    const parent = sampleCategories.find((c) => c.id === parentId)
    return parent ? parent.name : "Không có"
  }

  const handleToggleFeatured = (category: Category) => {
    // Giả lập việc cập nhật trạng thái nổi bật
    toast.success(
      `Đã ${category.is_featured ? "bỏ" : "đặt"} danh mục "${category.name}" ${category.is_featured ? "khỏi" : "thành"} danh mục nổi bật`,
    )
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    // Giả lập việc cập nhật thứ tự hiển thị
    toast.success("Đã cập nhật thứ tự hiển thị danh mục")
  }

  return (
    <Card className="overflow-hidden">
      {viewMode === "list" ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="categories">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]"></TableHead>
                        <TableHead>Tên danh mục</TableHead>
                        <TableHead className="hidden md:table-cell">Danh mục cha</TableHead>
                        <TableHead className="hidden md:table-cell">Thứ tự hiển thị</TableHead>
                        <TableHead className="hidden md:table-cell">Số sản phẩm</TableHead>
                        <TableHead>Nổi bật</TableHead>
                        <TableHead className="w-[100px] text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.map((category, index) => (
                        <Draggable key={category.id} draggableId={category.id} index={index}>
                          {(provided) => (
                            <TableRow ref={provided.innerRef} {...provided.draggableProps} className="group">
                              <TableCell>
                                <div
                                  {...provided.dragHandleProps}
                                  className="flex items-center justify-center cursor-move opacity-50 group-hover:opacity-100"
                                >
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
                                    className="lucide lucide-grip-vertical"
                                  >
                                    <path d="M9 13a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1z" />
                                    <path d="M19 13a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1z" />
                                    <path d="M9 21a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1z" />
                                    <path d="M19 21a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1z" />
                                  </svg>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{category.name}</div>
                                <div className="text-xs text-muted-foreground md:hidden">
                                  {getCategoryParentName(category.parent_category_id)}
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {getCategoryParentName(category.parent_category_id)}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="flex items-center space-x-2">
                                  <span>{category.display_order}</span>
                                  <div className="flex flex-col">
                                    <Button variant="ghost" size="icon" className="h-4 w-4">
                                      <ArrowUp className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-4 w-4">
                                      <ArrowDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Badge variant="outline">{categoryProductCounts[category.id] || 0}</Badge>
                              </TableCell>
                              <TableCell>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Switch
                                        checked={category.is_featured}
                                        onCheckedChange={() => handleToggleFeatured(category)}
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {category.is_featured ? "Bỏ nổi bật" : "Đặt nổi bật"}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
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
                                    <DropdownMenuItem onClick={() => handleMoveClick(category)}>
                                      <ArrowUp className="mr-2 h-4 w-4" />
                                      Di chuyển
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDuplicateClick(category)}>
                                      <Copy className="mr-2 h-4 w-4" />
                                      Nhân bản
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleDeleteClick(category)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Xóa
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <CategoryTree
          categories={filteredCategories}
          onDelete={handleDeleteClick}
          onMove={handleMoveClick}
          onDuplicate={handleDuplicateClick}
          onToggleFeatured={handleToggleFeatured}
        />
      )}

      <CategoryDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        category={categoryToAction}
      />

      <CategoryMoveDialog
        open={isMoveDialogOpen}
        onOpenChange={setIsMoveDialogOpen}
        category={categoryToAction}
        categories={sampleCategories}
      />

      <CategoryDuplicateDialog
        open={isDuplicateDialogOpen}
        onOpenChange={setIsDuplicateDialogOpen}
        category={categoryToAction}
      />
    </Card>
  )
}

