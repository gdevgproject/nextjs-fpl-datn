"use client"

import { useState } from "react"
import { useProducts } from "../hooks/use-products"
import { useDebounce } from "../hooks/use-debounce"
import { ProductTable } from "./product-table"
import { ProductDialog } from "./product-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { useBrands } from "../../brands/hooks/use-brands"
import { useGenders } from "../../genders/hooks/use-genders"
import { usePerfumeTypes } from "../../perfume-types/hooks/use-perfume-types"
import { useConcentrations } from "../../concentrations/hooks/use-concentrations"
import { useCategories } from "../../categories/hooks/use-categories"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function ProductManagement() {
  // State for search and filters
  const [search, setSearch] = useState("")
  const [brandId, setBrandId] = useState<number | undefined>(undefined)
  const [genderId, setGenderId] = useState<number | undefined>(undefined)
  const [perfumeTypeId, setPerfumeTypeId] = useState<number | undefined>(undefined)
  const [concentrationId, setConcentrationId] = useState<number | undefined>(undefined)
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const debouncedSearch = useDebounce(search, 500)

  // State for pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // State for sorting
  const [sortColumn, setSortColumn] = useState("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // State for product dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)

  // Fetch products with filters, pagination, and sorting
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    isError: isProductsError,
  } = useProducts(
    {
      search: debouncedSearch,
      brandId,
      genderId,
      perfumeTypeId,
      concentrationId,
      categoryId,
      includeDeleted,
    },
    { page, pageSize },
    { column: sortColumn, direction: sortDirection },
  )

  // Fetch filter options
  const { data: brandsData } = useBrands()
  const { data: gendersData } = useGenders()
  const { data: perfumeTypesData } = usePerfumeTypes()
  const { data: concentrationsData } = useConcentrations()
  const { data: categoriesData } = useCategories()

  // Handle sort change
  const handleSortChange = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Handle edit product
  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  // Handle create new product
  const handleCreateProduct = () => {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingProduct(null)
  }

  // Reset filters
  const handleResetFilters = () => {
    setSearch("")
    setBrandId(undefined)
    setGenderId(undefined)
    setPerfumeTypeId(undefined)
    setConcentrationId(undefined)
    setCategoryId(undefined)
    setIncludeDeleted(false)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm</h2>
        <Button onClick={handleCreateProduct}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm sản phẩm mới
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select
          value={brandId?.toString() || ""}
          onValueChange={(value) => setBrandId(value ? Number.parseInt(value) : undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Thương hiệu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả thương hiệu</SelectItem>
            {brandsData?.data?.map((brand: any) => (
              <SelectItem key={brand.id} value={brand.id.toString()}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={genderId?.toString() || ""}
          onValueChange={(value) => setGenderId(value ? Number.parseInt(value) : undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Giới tính" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả giới tính</SelectItem>
            {gendersData?.data?.map((gender: any) => (
              <SelectItem key={gender.id} value={gender.id.toString()}>
                {gender.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={perfumeTypeId?.toString() || ""}
          onValueChange={(value) => setPerfumeTypeId(value ? Number.parseInt(value) : undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Loại nước hoa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            {perfumeTypesData?.data?.map((type: any) => (
              <SelectItem key={type.id} value={type.id.toString()}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={concentrationId?.toString() || ""}
          onValueChange={(value) => setConcentrationId(value ? Number.parseInt(value) : undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Nồng độ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả nồng độ</SelectItem>
            {concentrationsData?.data?.map((concentration: any) => (
              <SelectItem key={concentration.id} value={concentration.id.toString()}>
                {concentration.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={categoryId?.toString() || ""}
          onValueChange={(value) => setCategoryId(value ? Number.parseInt(value) : undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categoriesData?.data?.map((category: any) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeDeleted"
            checked={includeDeleted}
            onCheckedChange={(checked) => setIncludeDeleted(checked as boolean)}
          />
          <Label htmlFor="includeDeleted">Hiển thị sản phẩm đã xóa</Label>
        </div>

        <Button variant="outline" onClick={handleResetFilters}>
          Đặt lại bộ lọc
        </Button>
      </div>

      {/* Products Table */}
      <ProductTable
        products={productsData?.data || []}
        isLoading={isLoadingProducts}
        isError={isProductsError}
        totalCount={productsData?.count || 0}
        page={page}
        pageSize={pageSize}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSortChange={handleSortChange}
        onEdit={handleEditProduct}
      />

      {/* Product Dialog */}
      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={editingProduct ? "edit" : "create"}
        product={editingProduct}
      />
    </div>
  )
}
