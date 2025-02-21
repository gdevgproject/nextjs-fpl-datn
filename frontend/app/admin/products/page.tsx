"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { fetchProducts, fetchCategories, fetchBrands, deleteProduct, updateProduct } from "@/lib/mockData"
import type { Product, Category, Brand } from "@/lib/mockData"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Trash2, Eye, Plus, FileDown, Filter } from "lucide-react"
import debounce from "lodash/debounce"

// Helper function to create a nested structure for categories
const createCategoryTree = (categories: Category[]): Category[] => {
  const categoryMap = new Map<string, Category>()
  const rootCategories: Category[] = []

  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] })
  })

  categoryMap.forEach((category) => {
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(category)
      }
    } else {
      rootCategories.push(category)
    }
  })

  return rootCategories
}

export default function ProductsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    status: "",
    gender: "",
    stock: "",
    minPrice: "",
    maxPrice: "",
    origin: "",
    isHot: "",
    concentration: "",
  })
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: "asc" | "desc" }>({
    key: "name",
    direction: "asc",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [bulkAction, setBulkAction] = useState("")
  const [bulkActionValue, setBulkActionValue] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedProducts, fetchedCategories, fetchedBrands] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchBrands(),
        ])
        setProducts(fetchedProducts)
        setCategories(createCategoryTree(fetchedCategories))
        setBrands(fetchedBrands)
      } catch (err) {
        setError("Failed to fetch data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        setSearchTerm(term)
        setCurrentPage(1)
      }, 300),
    [],
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      category: "",
      brand: "",
      status: "",
      gender: "",
      stock: "",
      minPrice: "",
      maxPrice: "",
      origin: "",
      isHot: "",
      concentration: "",
    })
    setCurrentPage(1)
  }

  const handleSort = (key: keyof Product) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.perfume_code.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = !filters.category || product.category === filters.category
        const matchesBrand = !filters.brand || product.fragrance_brand_id === filters.brand
        const matchesStatus = !filters.status || product.status === filters.status
        const matchesGender = !filters.gender || product.gender === filters.gender
        const matchesStock =
          !filters.stock ||
          (filters.stock === "inStock" && product.stock > 0) ||
          (filters.stock === "lowStock" && product.stock <= 10 && product.stock > 0) ||
          (filters.stock === "outOfStock" && product.stock === 0)
        const matchesPrice =
          (!filters.minPrice || product.price >= Number(filters.minPrice)) &&
          (!filters.maxPrice || product.price <= Number(filters.maxPrice))
        const matchesOrigin = !filters.origin || product.origin === filters.origin
        const matchesIsHot = !filters.isHot || product.is_hot === filters.isHot
        const matchesConcentration = !filters.concentration || product.concentration === filters.concentration

        return (
          matchesSearch &&
          matchesCategory &&
          matchesBrand &&
          matchesStatus &&
          matchesGender &&
          matchesStock &&
          matchesPrice &&
          matchesOrigin &&
          matchesIsHot &&
          matchesConcentration
        )
      })
      .sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
  }, [products, searchTerm, filters, sortConfig])

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedProducts, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const handleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  const handleSelectAllProducts = () => {
    setSelectedProducts((prev) => (prev.length === paginatedProducts.length ? [] : paginatedProducts.map((p) => p.id)))
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.length === 0) return

    try {
      setIsLoading(true)
      switch (bulkAction) {
        case "updateStatus":
          await Promise.all(
            selectedProducts.map((id) => updateProduct(id, { status: bulkActionValue as "active" | "hidden" })),
          )
          toast({ title: "Products updated", description: `Status updated for ${selectedProducts.length} products.` })
          break
        case "delete":
          await Promise.all(selectedProducts.map((id) => deleteProduct(id)))
          setProducts((prev) => prev.filter((p) => !selectedProducts.includes(p.id)))
          toast({ title: "Products deleted", description: `${selectedProducts.length} products have been deleted.` })
          break
        case "updatePrice":
          await Promise.all(
            selectedProducts.map((id) => {
              const product = products.find((p) => p.id === id)
              if (product) {
                const newPrice =
                  bulkActionValue.startsWith("+") || bulkActionValue.startsWith("-")
                    ? product.price + Number(bulkActionValue)
                    : Number(bulkActionValue)
                return updateProduct(id, { price: newPrice })
              }
            }),
          )
          toast({ title: "Products updated", description: `Price updated for ${selectedProducts.length} products.` })
          break
        case "updateStock":
          await Promise.all(
            selectedProducts.map((id) => {
              const product = products.find((p) => p.id === id)
              if (product) {
                const newStock =
                  bulkActionValue.startsWith("+") || bulkActionValue.startsWith("-")
                    ? product.stock + Number(bulkActionValue)
                    : Number(bulkActionValue)
                return updateProduct(id, { stock: newStock })
              }
            }),
          )
          toast({ title: "Products updated", description: `Stock updated for ${selectedProducts.length} products.` })
          break
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to perform bulk action. Please try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
      setBulkAction("")
      setBulkActionValue("")
      setSelectedProducts([])
      // Refresh products
      const updatedProducts = await fetchProducts()
      setProducts(updatedProducts)
    }
  }

  const handleExport = () => {
    // Implement CSV export logic here
    toast({ title: "Export", description: "CSV export functionality to be implemented." })
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="flex-1 w-full sm:w-auto">
          <Input placeholder="Search by name, perfume code..." onChange={handleSearchChange} className="w-full" />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category-filter">Category</Label>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="brand-filter">Brand</Label>
                <Select value={filters.brand} onValueChange={(value) => handleFilterChange("brand", value)}>
                  <SelectTrigger id="brand-filter">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="gender-filter">Gender</Label>
                <Select value={filters.gender} onValueChange={(value) => handleFilterChange("gender", value)}>
                  <SelectTrigger id="gender-filter">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="stock-filter">Stock</Label>
                <Select value={filters.stock} onValueChange={(value) => handleFilterChange("stock", value)}>
                  <SelectTrigger id="stock-filter">
                    <SelectValue placeholder="Select stock status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock</SelectItem>
                    <SelectItem value="inStock">In Stock</SelectItem>
                    <SelectItem value="lowStock">Low Stock</SelectItem>
                    <SelectItem value="outOfStock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="min-price">Min Price</Label>
                <Input
                  id="min-price"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                  placeholder="Min Price"
                />
              </div>
              <div>
                <Label htmlFor="max-price">Max Price</Label>
                <Input
                  id="max-price"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                  placeholder="Max Price"
                />
              </div>
              <div>
                <Label htmlFor="origin-filter">Origin</Label>
                <Select value={filters.origin} onValueChange={(value) => handleFilterChange("origin", value)}>
                  <SelectTrigger id="origin-filter">
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Origins</SelectItem>
                    {Array.from(new Set(products.map((p) => p.origin))).map((origin) => (
                      <SelectItem key={origin} value={origin}>
                        {origin}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="is-hot-filter">Is Hot</Label>
                <Select value={filters.isHot} onValueChange={(value) => handleFilterChange("isHot", value)}>
                  <SelectTrigger id="is-hot-filter">
                    <SelectValue placeholder="Select hot status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="concentration-filter">Concentration</Label>
                <Select
                  value={filters.concentration}
                  onValueChange={(value) => handleFilterChange("concentration", value)}
                >
                  <SelectTrigger id="concentration-filter">
                    <SelectValue placeholder="Select concentration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Concentrations</SelectItem>
                    <SelectItem value="Parfum">Parfum</SelectItem>
                    <SelectItem value="Eau de Parfum">Eau de Parfum</SelectItem>
                    <SelectItem value="Eau de Toilette">Eau de Toilette</SelectItem>
                    <SelectItem value="Eau de Cologne">Eau de Cologne</SelectItem>
                    <SelectItem value="Eau Fraiche">Eau Fraiche</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="mt-4" onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {selectedProducts.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center space-x-2">
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Bulk Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updateStatus">Update Status</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="updatePrice">Update Price</SelectItem>
                  <SelectItem value="updateStock">Update Stock</SelectItem>
                </SelectContent>
              </Select>
              {bulkAction === "updateStatus" && (
                <Select value={bulkActionValue} onValueChange={setBulkActionValue}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {(bulkAction === "updatePrice" || bulkAction === "updateStock") && (
                <Input
                  type="text"
                  placeholder={`Enter ${bulkAction === "updatePrice" ? "price" : "stock"} change`}
                  value={bulkActionValue}
                  onChange={(e) => setBulkActionValue(e.target.value)}
                  className="w-[200px]"
                />
              )}
              <Button onClick={handleBulkAction}>Apply</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedProducts.length === paginatedProducts.length}
                    onCheckedChange={handleSelectAllProducts}
                  />
                </TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Perfume Code</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                  Name {sortConfig.key === "name" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
                  Price {sortConfig.key === "price" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead>Listed Price</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("stock")}>
                  Stock {sortConfig.key === "stock" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => handleProductSelection(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <img
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>{product.perfume_code}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{categories.find((c) => c.id === product.category)?.name || "Unknown"}</TableCell>
                  <TableCell>{brands.find((b) => b.id === product.fragrance_brand_id)?.name || "Unknown"}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>
                    <span className="line-through text-gray-500">{formatCurrency(product.listed_price)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.stock > 10 ? "default" : product.stock > 0 ? "warning" : "destructive"}>
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status === "active" ? "success" : "secondary"}>{product.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/admin/products/${product.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Are you sure you want to delete this product?</DialogTitle>
                                  <DialogDescription>
                                    This action cannot be undone. This will permanently delete the product and remove
                                    the data from our servers.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => {}}>
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={async () => {
                                      try {
                                        await deleteProduct(product.id)
                                        setProducts(products.filter((p) => p.id !== product.id))
                                        toast({
                                          title: "Product deleted",
                                          description: "The product has been successfully deleted.",
                                        })
                                      } catch (error) {
                                        toast({
                                          title: "Error",
                                          description: "Failed to delete the product. Please try again.",
                                          variant: "destructive",
                                        })
                                      }
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span>Show</span>
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder={itemsPerPage} />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>items per page</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </Button>
          <span>{`Page ${currentPage} of ${totalPages}`}</span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
}

