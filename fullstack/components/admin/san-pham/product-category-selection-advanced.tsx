"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, ChevronRight, ChevronDown, X, Info } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"

interface Category {
  id: string
  name: string
  parent_category_id: string | null
  description?: string
  is_featured?: boolean
  children?: Category[]
}

interface ProductCategorySelectionProps {
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
  disabled?: boolean
}

export function ProductCategorySelectionAdvanced({
  selectedCategories,
  onCategoriesChange,
  disabled = false,
}: ProductCategorySelectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Mẫu dữ liệu danh mục
  const flatCategories: Category[] = [
    { id: "1", name: "Nước hoa nam", parent_category_id: null, is_featured: true },
    { id: "2", name: "Nước hoa nữ", parent_category_id: null, is_featured: true },
    { id: "3", name: "Nước hoa unisex", parent_category_id: null },
    { id: "4", name: "Nước hoa nam cao cấp", parent_category_id: "1" },
    { id: "5", name: "Nước hoa nam thể thao", parent_category_id: "1" },
    { id: "6", name: "Nước hoa nam văn phòng", parent_category_id: "1" },
    { id: "7", name: "Nước hoa nữ cao cấp", parent_category_id: "2", is_featured: true },
    { id: "8", name: "Nước hoa nữ ngọt ngào", parent_category_id: "2" },
    { id: "9", name: "Nước hoa nữ quyến rũ", parent_category_id: "2" },
    { id: "10", name: "Nước hoa mini", parent_category_id: null },
    { id: "11", name: "Nước hoa mini nam", parent_category_id: "10" },
    { id: "12", name: "Nước hoa mini nữ", parent_category_id: "10" },
    { id: "13", name: "Nước hoa mini unisex", parent_category_id: "10" },
    { id: "14", name: "Nước hoa nam mini cao cấp", parent_category_id: "11" },
  ]

  // Chuyển đổi danh sách phẳng thành cấu trúc cây
  const categoryTree = useMemo(() => {
    const tree: Category[] = []
    const map: Record<string, Category> = {}

    // Tạo map các danh mục
    flatCategories.forEach((category) => {
      map[category.id] = { ...category, children: [] }
    })

    // Xây dựng cây
    flatCategories.forEach((category) => {
      if (category.parent_category_id === null) {
        tree.push(map[category.id])
      } else if (map[category.parent_category_id]) {
        map[category.parent_category_id].children?.push(map[category.id])
      }
    })

    return tree
  }, [flatCategories])

  // Lọc danh mục theo từ khóa tìm kiếm
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categoryTree

    const filtered: Category[] = []
    const searchTermLower = searchTerm.toLowerCase()

    // Hàm đệ quy để tìm kiếm
    const searchInCategory = (category: Category): boolean => {
      const nameMatch = category.name.toLowerCase().includes(searchTermLower)

      if (category.children && category.children.length > 0) {
        const childrenMatch = category.children.filter(searchInCategory)

        if (childrenMatch.length > 0) {
          const newCategory = { ...category, children: childrenMatch }
          filtered.push(newCategory)
          return true
        }
      }

      if (nameMatch) {
        filtered.push({ ...category, children: [] })
        return true
      }

      return false
    }

    categoryTree.forEach(searchInCategory)
    return filtered
  }, [categoryTree, searchTerm])

  // Tự động mở rộng danh mục cha khi có danh mục con được chọn
  useEffect(() => {
    const parentsToExpand = new Set<string>()

    const findParents = (categoryId: string) => {
      const category = flatCategories.find((c) => c.id === categoryId)
      if (category && category.parent_category_id) {
        parentsToExpand.add(category.parent_category_id)
        findParents(category.parent_category_id)
      }
    }

    selectedCategories.forEach((id) => findParents(id))

    setExpandedCategories((prev) => {
      const newExpanded = [...prev]
      parentsToExpand.forEach((id) => {
        if (!newExpanded.includes(id)) {
          newExpanded.push(id)
        }
      })
      return newExpanded
    })
  }, [selectedCategories, flatCategories])

  // Xử lý toggle expand/collapse
  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  // Xử lý chọn/bỏ chọn danh mục
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (disabled) return

    if (checked) {
      onCategoriesChange([...selectedCategories, categoryId])
    } else {
      onCategoriesChange(selectedCategories.filter((id) => id !== categoryId))
    }
  }

  // Xóa một danh mục đã chọn
  const removeCategory = (categoryId: string) => {
    if (disabled) return
    onCategoriesChange(selectedCategories.filter((id) => id !== categoryId))
  }

  // Xóa tất cả danh mục đã chọn
  const clearAllCategories = () => {
    if (disabled) return
    onCategoriesChange([])
  }

  // Lấy tên danh mục từ ID
  const getCategoryName = (categoryId: string) => {
    const category = flatCategories.find((c) => c.id === categoryId)
    return category ? category.name : categoryId
  }

  // Hiển thị danh mục dạng cây
  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map((category) => (
      <div key={category.id} className="category-item" style={{ paddingLeft: `${level * 16}px` }}>
        <div className="flex items-center py-1.5 hover:bg-muted/50 rounded-md px-2 group">
          {category.children && category.children.length > 0 ? (
            <Button variant="ghost" size="icon" className="h-6 w-6 p-0 mr-1" onClick={() => toggleExpand(category.id)}>
              {expandedCategories.includes(category.id) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-7"></div>
          )}

          <div className="flex items-center flex-1">
            <Checkbox
              id={`category-${category.id}`}
              checked={selectedCategories.includes(category.id)}
              onCheckedChange={(checked) => handleCategoryChange(category.id, checked === true)}
              disabled={disabled}
              className="mr-2"
            />
            <label htmlFor={`category-${category.id}`} className="text-sm flex items-center cursor-pointer flex-1">
              {category.name}
              {category.is_featured && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Nổi bật
                </Badge>
              )}
            </label>

            {category.description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{category.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {category.children && category.children.length > 0 && expandedCategories.includes(category.id) && (
          <div className="ml-2 border-l pl-2 border-border/50">{renderCategoryTree(category.children, level + 1)}</div>
        )}
      </div>
    ))
  }

  // Component hiển thị danh mục đã chọn
  const SelectedCategoriesList = () => (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">Danh mục đã chọn ({selectedCategories.length})</h4>
        {selectedCategories.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllCategories}
            disabled={disabled}
            className="h-8 px-2 text-xs"
          >
            Xóa tất cả
          </Button>
        )}
      </div>

      {selectedCategories.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa chọn danh mục nào</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((categoryId) => (
            <Badge key={categoryId} variant="secondary" className="flex items-center gap-1 px-2 py-1">
              {getCategoryName(categoryId)}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCategory(categoryId)}
                disabled={disabled}
                className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )

  // Hiển thị trên desktop
  if (isDesktop) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Danh mục sản phẩm</CardTitle>
          <CardDescription>Chọn một hoặc nhiều danh mục cho sản phẩm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm danh mục..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <ScrollArea className="h-[300px] rounded-md border">
              <div className="p-2">
                {filteredCategories.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">Không tìm thấy danh mục nào</p>
                ) : (
                  renderCategoryTree(filteredCategories)
                )}
              </div>
            </ScrollArea>

            <SelectedCategoriesList />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Hiển thị trên mobile và tablet
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Danh mục sản phẩm</CardTitle>
        <CardDescription>Chọn một hoặc nhiều danh mục cho sản phẩm</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span>Chọn danh mục ({selectedCategories.length})</span>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Chọn danh mục sản phẩm</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-4">
                <div className="relative mb-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Tìm kiếm danh mục..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <ScrollArea className="h-[50vh] rounded-md border">
                  <div className="p-2">
                    {filteredCategories.length === 0 ? (
                      <p className="text-center py-4 text-muted-foreground">Không tìm thấy danh mục nào</p>
                    ) : (
                      renderCategoryTree(filteredCategories)
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DrawerContent>
          </Drawer>

          <SelectedCategoriesList />
        </div>
      </CardContent>
    </Card>
  )
}

