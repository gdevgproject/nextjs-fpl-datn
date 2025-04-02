"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

interface CategoryFiltersProps {
  viewMode: "list" | "tree"
  onViewModeChange: (mode: "list" | "tree") => void
  filters: {
    search: string
    status: string
    featured: string
    parentCategory: string
  }
  onFilterChange: (name: string, value: string) => void
}

export function CategoryFilters({ viewMode, onViewModeChange, filters, onFilterChange }: CategoryFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm danh mục..."
              className="pl-8"
              value={filters.search}
              onChange={(e) => onFilterChange("search", e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={filters.featured} onValueChange={(value) => onFilterChange("featured", value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái nổi bật" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="featured">Nổi bật</SelectItem>
                <SelectItem value="not-featured">Không nổi bật</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.parentCategory} onValueChange={(value) => onFilterChange("parentCategory", value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Danh mục cha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="none">Không có danh mục cha</SelectItem>
                <SelectItem value="1">Nước hoa nam</SelectItem>
                <SelectItem value="2">Nước hoa nữ</SelectItem>
                <SelectItem value="3">Nước hoa unisex</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2 ml-auto">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => onViewModeChange("list")}
              >
                Danh sách
              </Button>
              <Button
                variant={viewMode === "tree" ? "default" : "outline"}
                size="sm"
                onClick={() => onViewModeChange("tree")}
              >
                Cây danh mục
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

