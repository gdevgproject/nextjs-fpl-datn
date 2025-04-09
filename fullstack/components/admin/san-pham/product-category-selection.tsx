"use client"

import { useState, useEffect } from "react"
import { ChevronRight, FolderTree, Search } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

interface Category {
  id: string
  name: string
  parent_id: string | null
  children?: Category[]
}

interface ProductCategorySelectionProps {
  productId?: string
  onProgressChange: (progress: number) => void
}

export function ProductCategorySelection({ productId, onProgressChange }: ProductCategorySelectionProps) {
  // Dữ liệu mẫu cho danh mục
  const sampleCategories: Category[] = [
    { id: "1", name: "Nước hoa nam", parent_id: null },
    { id: "2", name: "Nước hoa nữ", parent_id: null },
    { id: "3", name: "Nước hoa unisex", parent_id: null },
    { id: "4", name: "Nước hoa mini", parent_id: null },
    { id: "5", name: "Gift set", parent_id: null },
    { id: "6", name: "Nước hoa nam cao cấp", parent_id: "1" },
    { id: "7", name: "Nước hoa nam phổ thông", parent_id: "1" },
    { id: "8", name: "Nước hoa nữ cao cấp", parent_id: "2" },
    { id: "9", name: "Nước hoa nữ phổ thông", parent_id: "2" },
    { id: "10", name: "Nước hoa unisex cao cấp", parent_id: "3" },
    { id: "11", name: "Nước hoa unisex phổ thông", parent_id: "3" },
  ]

  // Dữ liệu mẫu cho sản phẩm đang chỉnh sửa
  const sampleSelectedCategories = productId ? ["2", "8"] : []

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(sampleSelectedCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  // Tính toán tiến độ hoàn thành
  useEffect(() => {
    // Nếu có ít nhất 1 danh mục được chọn, tiến độ là 100%
    // Nếu không có danh mục nào được chọn, tiến độ là 0%
    onProgressChange(selectedCategories.length > 0 ? 100 : 0)
  }, [selectedCategories, onProgressChange])

  // Chuyển đổi danh sách phẳng thành cấu trúc cây
  useEffect(() => {
    const buildCategoryTree = (categories: Category[], parentId: string | null = null): Category[] => {
      return categories
        .filter((category) => category.parent_id === parentId)
        .map((category) => ({
          ...category,
          children: buildCategoryTree(categories, category.id),
        }))
    }

    const categoryTree = buildCategoryTree(sampleCategories)
    setCategories(categoryTree)
  }, [])

  // Tự động mở rộng danh mục cha khi có danh mục con được chọn
  useEffect(() => {
    if (selectedCategories.length > 0) {
      const parentsToExpand = new Set<string>()

      const findParents = (categoryId: string) => {
        const category = sampleCategories.find((cat) => cat.id === categoryId)
        if (category && category.parent_id) {
          parentsToExpand.add(category.parent_id)
          findParents(category.parent_id)
        }
      }

      selectedCategories.forEach((id) => findParents(id))

      setExpandedCategories((prev) => [...new Set([...prev, ...Array.from(parentsToExpand)])])
    }
  }, [selectedCategories])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const renderCategoryTree = (categories: Category[]) => {
    return categories
      .filter(
        (category) =>
          searchTerm === "" ||
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.children &&
            category.children.some((child) => child.name.toLowerCase().includes(searchTerm.toLowerCase()))),
      )
      .map((category) => (
        <div key={category.id} className="mb-1">
          <div className="flex items-center space-x-2">
            {category.children && category.children.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => toggleExpand(category.id)}
                type="button"
              >
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${
                    expandedCategories.includes(category.id) ? "rotate-90" : ""
                  }`}
                />
              </Button>
            )}
            {!category.children || category.children.length === 0 ? <div className="w-6"></div> : null}
            <div className="flex flex-1 items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
              />
              <Label htmlFor={`category-${category.id}`} className="cursor-pointer text-sm font-medium">
                {category.name}
              </Label>
            </div>
          </div>

          {category.children && category.children.length > 0 && expandedCategories.includes(category.id) && (
            <div className="ml-8 mt-1">{renderCategoryTree(category.children)}</div>
          )}
        </div>
      ))
  }

  const getSelectedCategoryNames = () => {
    return selectedCategories
      .map((id) => {
        const category = sampleCategories.find((cat) => cat.id === id)
        return category ? category.name : ""
      })
      .filter(Boolean)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh mục sản phẩm</CardTitle>
        <CardDescription>Chọn một hoặc nhiều danh mục cho sản phẩm này.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
        </div>

        {selectedCategories.length > 0 && (
          <div>
            <Label className="text-sm font-medium">Danh mục đã chọn:</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {getSelectedCategoryNames().map((name, index) => (
                <Badge key={index} variant="secondary">
                  {name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-md border">
          <div className="flex items-center justify-between border-b p-3">
            <div className="flex items-center space-x-2">
              <FolderTree className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Cây danh mục</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedCategories(categories.map((cat) => cat.id))}
              type="button"
            >
              Mở rộng tất cả
            </Button>
          </div>
          <ScrollArea className="h-[300px]">
            <div className="p-4">{renderCategoryTree(categories)}</div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}

