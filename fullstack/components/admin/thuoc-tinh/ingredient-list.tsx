"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Search,
  FileDown,
  FileUp,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FormLabel } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import type { Ingredient } from "@/types/san-pham"

export function IngredientList() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [ingredientToEdit, setIngredientToEdit] = useState<Ingredient | null>(null)
  const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null)
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
  })
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [filterCategory, setFilterCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  // Dữ liệu mẫu cho thành phần
  const sampleIngredients: Ingredient[] = [
    {
      id: "1",
      name: "Alcohol",
      description: "Dung môi phổ biến trong nước hoa",
      category: "Dung môi",
      created_at: "2023-01-01T00:00:00Z",
      product_count: 42,
    },
    {
      id: "2",
      name: "Aqua",
      description: "Nước tinh khiết",
      category: "Dung môi",
      created_at: "2023-01-01T00:00:00Z",
      product_count: 38,
    },
    {
      id: "3",
      name: "Citral",
      description: "Hương chanh tự nhiên",
      category: "Hương liệu",
      created_at: "2023-01-01T00:00:00Z",
      product_count: 15,
    },
    {
      id: "4",
      name: "Citronellol",
      description: "Hương hoa hồng",
      category: "Hương liệu",
      created_at: "2023-01-01T00:00:00Z",
      product_count: 23,
    },
    {
      id: "5",
      name: "Geraniol",
      description: "Hương hoa hồng và cây cỏ",
      category: "Hương liệu",
      created_at: "2023-01-01T00:00:00Z",
      product_count: 19,
    },
    {
      id: "6",
      name: "Limonene",
      description: "Hương cam quýt",
      category: "Hương liệu",
      created_at: "2023-01-01T00:00:00Z",
      product_count: 31,
    },
    {
      id: "7",
      name: "Linalool",
      description: "Hương hoa lavender",
      category: "Hương liệu",
      created_at: "2023-01-02T00:00:00Z",
      product_count: 27,
    },
    {
      id: "8",
      name: "Benzyl Alcohol",
      description: "Chất bảo quản và hương liệu",
      category: "Bảo quản",
      created_at: "2023-01-02T00:00:00Z",
      product_count: 12,
    },
    {
      id: "9",
      name: "Coumarin",
      description: "Hương vani và hạnh nhân",
      category: "Hương liệu",
      created_at: "2023-01-03T00:00:00Z",
      product_count: 18,
    },
    {
      id: "10",
      name: "Eugenol",
      description: "Hương đinh hương",
      category: "Hương liệu",
      created_at: "2023-01-03T00:00:00Z",
      product_count: 9,
    },
    {
      id: "11",
      name: "Benzyl Benzoate",
      description: "Chất cố định hương",
      category: "Cố định",
      created_at: "2023-01-04T00:00:00Z",
      product_count: 7,
    },
    {
      id: "12",
      name: "Benzyl Salicylate",
      description: "Hương hoa và chất cố định",
      category: "Cố định",
      created_at: "2023-01-04T00:00:00Z",
      product_count: 5,
    },
  ]

  // Danh sách các danh mục thành phần
  const categories = ["Dung môi", "Hương liệu", "Bảo quản", "Cố định", "Khác"]

  // Giả lập việc tải dữ liệu
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Lọc và sắp xếp thành phần
  const filteredIngredients = sampleIngredients
    .filter((ingredient) => {
      const matchesSearch =
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ingredient.description && ingredient.description.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = filterCategory === "all" || ingredient.category === filterCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      } else if (sortBy === "category") {
        return sortOrder === "asc"
          ? (a.category || "").localeCompare(b.category || "")
          : (b.category || "").localeCompare(a.category || "")
      } else if (sortBy === "product_count") {
        return sortOrder === "asc"
          ? (a.product_count || 0) - (b.product_count || 0)
          : (b.product_count || 0) - (a.product_count || 0)
      }
      return 0
    })

  // Phân trang
  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage)
  const paginatedIngredients = filteredIngredients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleAddClick = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
    })
    setIsAddDialogOpen(true)
  }

  const handleEditClick = (ingredient: Ingredient) => {
    setIngredientToEdit(ingredient)
    setFormData({
      name: ingredient.name,
      description: ingredient.description || "",
      category: ingredient.category || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (ingredient: Ingredient) => {
    setIngredientToDelete(ingredient)
    setIsDeleteDialogOpen(true)
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Giả lập việc thêm thành phần
    console.log("Thêm thành phần:", formData)
    toast({
      title: "Thêm thành công",
      description: `Đã thêm thành phần "${formData.name}"`,
    })
    setIsAddDialogOpen(false)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Giả lập việc cập nhật thành phần
    console.log("Cập nhật thành phần:", ingredientToEdit?.id, formData)
    toast({
      title: "Cập nhật thành công",
      description: `Đã cập nhật thành phần "${formData.name}"`,
    })
    setIsEditDialogOpen(false)
  }

  const handleDeleteConfirm = () => {
    // Giả lập việc xóa thành phần
    console.log("Xóa thành phần:", ingredientToDelete)
    toast({
      title: "Xóa thành công",
      description: `Đã xóa thành phần "${ingredientToDelete?.name}"`,
      variant: "destructive",
    })
    setIsDeleteDialogOpen(false)
    setIngredientToDelete(null)
  }

  const handleBulkDeleteConfirm = () => {
    // Giả lập việc xóa nhiều thành phần
    console.log("Xóa nhiều thành phần:", selectedIngredients)
    toast({
      title: "Xóa thành công",
      description: `Đã xóa ${selectedIngredients.length} thành phần`,
      variant: "destructive",
    })
    setIsBulkDeleteDialogOpen(false)
    setSelectedIngredients([])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectCategory = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleFilterCategory = (value: string) => {
    setFilterCategory(value)
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    if (value === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(value)
      setSortOrder("asc")
    }
    setCurrentPage(1)
  }

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedIngredients(paginatedIngredients.map((ingredient) => ingredient.id))
    } else {
      setSelectedIngredients([])
    }
  }

  const handleSelectIngredient = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIngredients((prev) => [...prev, id])
    } else {
      setSelectedIngredients((prev) => prev.filter((ingredientId) => ingredientId !== id))
    }
  }

  const handleBulkDeleteClick = () => {
    if (selectedIngredients.length > 0) {
      setIsBulkDeleteDialogOpen(true)
    }
  }

  const handleExportClick = () => {
    // Giả lập việc xuất dữ liệu
    console.log("Xuất dữ liệu thành phần")
    toast({
      title: "Xuất dữ liệu thành công",
      description: "Dữ liệu thành phần đã được xuất thành công",
    })
  }

  const handleImportClick = () => {
    setIsImportDialogOpen(true)
  }

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Giả lập việc nhập dữ liệu
    console.log("Nhập dữ liệu thành phần")
    toast({
      title: "Nhập dữ liệu thành công",
      description: "Dữ liệu thành phần đã được nhập thành công",
    })
    setIsImportDialogOpen(false)
  }

  const handleFilterClick = () => {
    setIsFilterDialogOpen(true)
  }

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Giả lập việc lọc dữ liệu
    console.log("Lọc dữ liệu thành phần")
    setIsFilterDialogOpen(false)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (currentPage > 1) handlePageChange(currentPage - 1)
              }}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(page)
                }}
                isActive={page === currentPage}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (currentPage < totalPages) handlePageChange(currentPage + 1)
              }}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <Skeleton className="h-4 w-4" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-40" />
        </TableCell>
        <TableCell className="hidden md:table-cell">
          <Skeleton className="h-4 w-60" />
        </TableCell>
        <TableCell className="hidden md:table-cell">
          <Skeleton className="h-6 w-20" />
        </TableCell>
        <TableCell className="hidden lg:table-cell">
          <Skeleton className="h-4 w-10" />
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </TableCell>
      </TableRow>
    ))
  }

  const renderGridSkeletons = () => {
    return Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="rounded-lg border p-4 space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-20" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-16" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    ))
  }

  const renderIngredientGrid = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        {isLoading
          ? renderGridSkeletons()
          : paginatedIngredients.map((ingredient) => (
              <div key={ingredient.id} className="rounded-lg border p-4 space-y-2 relative">
                <div className="absolute top-3 right-3">
                  <Checkbox
                    checked={selectedIngredients.includes(ingredient.id)}
                    onCheckedChange={(checked) => handleSelectIngredient(ingredient.id, checked as boolean)}
                  />
                </div>
                <h3 className="font-medium text-lg">{ingredient.name}</h3>
                {ingredient.description && <p className="text-sm text-muted-foreground">{ingredient.description}</p>}
                <div className="flex items-center space-x-2">
                  {ingredient.category && (
                    <Badge variant="outline" className="bg-primary/10">
                      {ingredient.category}
                    </Badge>
                  )}
                  {ingredient.product_count !== undefined && (
                    <Badge variant="secondary">{ingredient.product_count} sản phẩm</Badge>
                  )}
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(ingredient)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Chỉnh sửa</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(ingredient)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Xóa</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Danh sách thành phần</CardTitle>
            <CardDescription>Quản lý các thành phần được sử dụng trong sản phẩm</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm thành phần
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportClick}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Xuất dữ liệu
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImportClick}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Nhập dữ liệu
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleBulkDeleteClick}
                  disabled={selectedIngredients.length === 0}
                  className={selectedIngredients.length === 0 ? "opacity-50 cursor-not-allowed" : "text-destructive"}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa đã chọn ({selectedIngredients.length})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-auto sm:flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm thành phần..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={filterCategory} onValueChange={handleFilterCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tất cả danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
                      >
                        {viewMode === "list" ? (
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
                            className="lucide lucide-grid-2x2"
                          >
                            <rect width="18" height="18" x="3" y="3" rx="2" />
                            <path d="M3 12h18" />
                            <path d="M12 3v18" />
                          </svg>
                        ) : (
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
                            className="lucide lucide-list"
                          >
                            <line x1="8" x2="21" y1="6" y2="6" />
                            <line x1="8" x2="21" y1="12" y2="12" />
                            <line x1="8" x2="21" y1="18" y2="18" />
                            <line x1="3" x2="3" y1="6" y2="6" />
                            <line x1="3" x2="3" y1="12" y2="12" />
                            <line x1="3" x2="3" y1="18" y2="18" />
                          </svg>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{viewMode === "list" ? "Chế độ lưới" : "Chế độ danh sách"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {viewMode === "list" ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={
                          paginatedIngredients.length > 0 &&
                          paginatedIngredients.every((ingredient) => selectedIngredients.includes(ingredient.id))
                        }
                        onCheckedChange={handleSelectAllChange}
                        aria-label="Chọn tất cả"
                      />
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSortChange("name")}>
                      <div className="flex items-center space-x-1">
                        <span>Tên thành phần</span>
                        {sortBy === "name" && (
                          <ArrowUpDown className={`h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Mô tả</TableHead>
                    <TableHead
                      className="hidden md:table-cell cursor-pointer"
                      onClick={() => handleSortChange("category")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Danh mục</span>
                        {sortBy === "category" && (
                          <ArrowUpDown className={`h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="hidden lg:table-cell cursor-pointer"
                      onClick={() => handleSortChange("product_count")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Sản phẩm</span>
                        {sortBy === "product_count" && (
                          <ArrowUpDown className={`h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    renderSkeletonRows()
                  ) : paginatedIngredients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-muted-foreground">Không tìm thấy thành phần nào</p>
                          <Button
                            variant="link"
                            onClick={() => {
                              setSearchTerm("")
                              setFilterCategory("all")
                            }}
                          >
                            Xóa bộ lọc
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedIngredients.map((ingredient) => (
                      <TableRow key={ingredient.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIngredients.includes(ingredient.id)}
                            onCheckedChange={(checked) => handleSelectIngredient(ingredient.id, checked as boolean)}
                            aria-label={`Chọn ${ingredient.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{ingredient.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{ingredient.description || "-"}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {ingredient.category ? (
                            <Badge variant="outline" className="bg-primary/10">
                              {ingredient.category}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {ingredient.product_count !== undefined ? (
                            <Badge variant="secondary">{ingredient.product_count}</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(ingredient)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Chỉnh sửa</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteClick(ingredient)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Xóa</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            renderIngredientGrid()
          )}

          {renderPagination()}
        </div>
      </CardContent>

      {/* Dialog thêm thành phần */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm thành phần mới</DialogTitle>
            <DialogDescription>Nhập thông tin cho thành phần mới</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <FormLabel htmlFor="name">
                  Tên thành phần <span className="text-red-500">*</span>
                </FormLabel>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nhập tên thành phần"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <FormLabel htmlFor="description">Mô tả</FormLabel>
                <Input
                  id="description"
                  name="description"
                  placeholder="Nhập mô tả thành phần"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <FormLabel htmlFor="category">Danh mục</FormLabel>
                <Select value={formData.category} onValueChange={handleSelectCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa thành phần */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thành phần</DialogTitle>
            <DialogDescription>Cập nhật thông tin thành phần</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <FormLabel htmlFor="edit-name">
                  Tên thành phần <span className="text-red-500">*</span>
                </FormLabel>
                <Input
                  id="edit-name"
                  name="name"
                  placeholder="Nhập tên thành phần"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <FormLabel htmlFor="edit-description">Mô tả</FormLabel>
                <Input
                  id="edit-description"
                  name="description"
                  placeholder="Nhập mô tả thành phần"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <FormLabel htmlFor="edit-category">Danh mục</FormLabel>
                <Select value={formData.category} onValueChange={handleSelectCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog xóa thành phần */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa thành phần</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa thành phần "{ingredientToDelete?.name}"?
              {ingredientToDelete?.product_count ? (
                <div className="mt-2 text-destructive">
                  Thành phần này đang được sử dụng trong {ingredientToDelete.product_count} sản phẩm. Việc xóa có thể
                  ảnh hưởng đến dữ liệu sản phẩm.
                </div>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xóa nhiều thành phần */}
      <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa nhiều thành phần</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa {selectedIngredients.length} thành phần đã chọn? Hành động này không thể hoàn
              tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleBulkDeleteConfirm}>
              Xóa {selectedIngredients.length} thành phần
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog nhập dữ liệu */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập dữ liệu thành phần</DialogTitle>
            <DialogDescription>Tải lên file Excel hoặc CSV chứa dữ liệu thành phần</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleImportSubmit}>
            <div className="space-y-4 py-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">Kéo và thả file vào đây hoặc click để chọn file</p>
                <Input type="file" accept=".xlsx,.xls,.csv" className="hidden" id="file-upload" />
                <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                  Chọn file
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Hỗ trợ định dạng: .xlsx, .xls, .csv</p>
              </div>
              <div>
                <a href="#" className="text-sm text-primary hover:underline">
                  Tải xuống mẫu file nhập liệu
                </a>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">
                <FileUp className="mr-2 h-4 w-4" />
                Nhập dữ liệu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog lọc nâng cao */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lọc thành phần</DialogTitle>
            <DialogDescription>Thiết lập các điều kiện lọc thành phần</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFilterSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <FormLabel htmlFor="filter-category">Danh mục</FormLabel>
                <Select value={filterCategory} onValueChange={handleFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <FormLabel htmlFor="filter-sort">Sắp xếp theo</FormLabel>
                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    setSortBy(value)
                    setSortOrder("asc")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tiêu chí sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Tên thành phần</SelectItem>
                    <SelectItem value="category">Danh mục</SelectItem>
                    <SelectItem value="product_count">Số lượng sản phẩm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <FormLabel htmlFor="filter-order">Thứ tự</FormLabel>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thứ tự sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Tăng dần</SelectItem>
                    <SelectItem value="desc">Giảm dần</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFilterCategory("all")
                  setSortBy("name")
                  setSortOrder("asc")
                  setIsFilterDialogOpen(false)
                }}
              >
                Đặt lại
              </Button>
              <Button type="submit">
                <Filter className="mr-2 h-4 w-4" />
                Áp dụng
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

