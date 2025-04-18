"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CategoryTable } from "./category-table"
import { CategoryDialog } from "./category-dialog"
import { useCategories } from "../hooks/use-categories"
import { useDebounce } from "../hooks/use-debounce"

export function CategoryManagement() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState<{ column: string; direction: "asc" | "desc" }>({
    column: "display_order",
    direction: "asc",
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")

  // Fetch categories with filters, pagination, and sorting
  const {
    data: categoriesData,
    isLoading,
    isError,
    error,
  } = useCategories(
    {
      search: debouncedSearch,
    },
    {
      page,
      pageSize,
    },
    sort,
  )

  // Handle creating a new category
  const handleCreate = () => {
    setDialogMode("create")
    setEditingCategory(null)
    setIsDialogOpen(true)
  }

  // Handle editing an existing category
  const handleEdit = (category: any) => {
    setDialogMode("edit")
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[300px]"
          />
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      <CategoryTable
        categories={categoriesData?.data || []}
        count={categoriesData?.count || 0}
        isLoading={isLoading}
        isError={isError}
        error={error}
        page={page}
        pageSize={pageSize}
        sort={sort}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSortChange={setSort}
        onEdit={handleEdit}
      />

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        category={editingCategory}
      />
    </div>
  )
}
