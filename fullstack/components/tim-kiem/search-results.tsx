"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/san-pham/product-card"
import { BrandCard } from "@/components/thuong-hieu/brand-card"
import { CategoryCard } from "@/components/danh-muc/category-card"
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Grid2X2, List, SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { SearchFilters } from "@/components/tim-kiem/search-filters"
import { useMediaQuery } from "@/hooks/use-media-query"
import { SelectedFilters } from "@/components/san-pham/selected-filters"

interface SearchResultsProps {
  query: string
  page: number
  sort: string
  searchParams: Record<string, string | string[] | undefined>
}

// Giả lập dữ liệu sản phẩm
const mockProducts = Array(20)
  .fill(0)
  .map((_, i) => ({
    id: i + 1,
    name: `Nước hoa ${i + 1}`,
    slug: `nuoc-hoa-${i + 1}`,
    brand: "Brand Name",
    brandSlug: "brand-name",
    price: 1200000 + i * 100000,
    salePrice: i % 3 === 0 ? 1000000 + i * 80000 : null,
    image: `/placeholder.svg?height=300&width=300&text=Nước+hoa+${i + 1}`,
    rating: 4.5,
    reviewCount: 12,
    isNew: i % 7 === 0,
    isBestSeller: i % 5 === 0,
    isSale: i % 3 === 0,
  }))

// Giả lập dữ liệu thương hiệu
const mockBrands = Array(8)
  .fill(0)
  .map((_, i) => ({
    id: i + 1,
    name: `Brand ${i + 1}`,
    slug: `brand-${i + 1}`,
    logo: `/placeholder.svg?height=80&width=160&text=Brand+${i + 1}`,
    productCount: 10 + i * 5,
  }))

// Giả lập dữ liệu danh mục
const mockCategories = Array(6)
  .fill(0)
  .map((_, i) => ({
    id: i + 1,
    name: `Category ${i + 1}`,
    slug: `category-${i + 1}`,
    image: `/placeholder.svg?height=200&width=200&text=Category+${i + 1}`,
    productCount: 15 + i * 8,
  }))

export function SearchResults({ query, page, sort, searchParams }: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState(sort)
  const [products, setProducts] = useState(mockProducts)
  const [brands, setBrands] = useState(mockBrands)
  const [categories, setCategories] = useState(mockCategories)
  const [isLoading, setIsLoading] = useState(true)
  const [openFilters, setOpenFilters] = useState(false)
  const router = useRouter()
  const searchParamsObj = useSearchParams()

  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const isTablet = useMediaQuery("(min-width: 768px)")

  const itemsPerPage = 12
  const totalPages = Math.ceil(products.length / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const displayedProducts = products.slice(startIndex, startIndex + itemsPerPage)

  const type = searchParams.type as string | undefined

  // Giả lập tìm kiếm và sắp xếp
  useEffect(() => {
    setIsLoading(true)

    // Giả lập delay API
    const timer = setTimeout(() => {
      let filteredProducts = [...mockProducts]

      // Lọc theo query
      if (query) {
        filteredProducts = filteredProducts.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      }

      // Sắp xếp
      switch (sortBy) {
        case "price-asc":
          filteredProducts.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price))
          break
        case "price-desc":
          filteredProducts.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price))
          break
        case "name-asc":
          filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
          break
        case "name-desc":
          filteredProducts.sort((a, b) => b.name.localeCompare(a.name))
          break
        case "rating":
          filteredProducts.sort((a, b) => b.rating - a.rating)
          break
        default: // relevance
        // Không cần sắp xếp
      }

      setProducts(filteredProducts)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [query, sortBy])

  const handleSortChange = (value: string) => {
    setSortBy(value)

    const params = new URLSearchParams(searchParamsObj.toString())
    params.set("sort", value)
    router.push(`/tim-kiem?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParamsObj.toString())
    params.set("page", newPage.toString())
    router.push(`/tim-kiem?${params.toString()}`)
  }

  const getActiveFilters = () => {
    const filters: { id: string; label: string; value: string }[] = []

    if (searchParams.category) {
      filters.push({
        id: "category",
        label: "Danh mục",
        value: searchParams.category as string,
      })
    }

    if (searchParams.brand) {
      filters.push({
        id: "brand",
        label: "Thương hiệu",
        value: searchParams.brand as string,
      })
    }

    if (searchParams.gender) {
      filters.push({
        id: "gender",
        label: "Giới tính",
        value: searchParams.gender as string,
      })
    }

    if (searchParams.price_min && searchParams.price_max) {
      filters.push({
        id: "price",
        label: "Giá",
        value: `${searchParams.price_min} - ${searchParams.price_max}`,
      })
    }

    if (searchParams.rating) {
      filters.push({
        id: "rating",
        label: "Đánh giá",
        value: `${searchParams.rating} sao trở lên`,
      })
    }

    return filters
  }

  const removeFilter = (filterId: string) => {
    const params = new URLSearchParams(searchParamsObj.toString())

    if (filterId === "price") {
      params.delete("price_min")
      params.delete("price_max")
    } else {
      params.delete(filterId)
    }

    router.push(`/tim-kiem?${params.toString()}`)
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams()
    params.set("q", query)
    if (type) params.set("type", type)
    router.push(`/tim-kiem?${params.toString()}`)
  }

  if (isLoading) {
    return <div className="py-8 text-center">Đang tìm kiếm...</div>
  }

  if (products.length === 0 && !type) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-xl font-medium mb-4">Không tìm thấy kết quả nào phù hợp</h2>
        <p className="text-muted-foreground mb-6">Vui lòng thử lại với từ khóa khác hoặc điều chỉnh bộ lọc</p>
        <Button asChild>
          <Link href="/san-pham">Xem tất cả sản phẩm</Link>
        </Button>
      </div>
    )
  }

  // Hiển thị kết quả dựa trên loại tìm kiếm
  const renderResults = () => {
    if (type === "brands") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      )
    }

    if (type === "categories") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )
    }

    // Mặc định hiển thị sản phẩm
    return viewMode === "grid" ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              brand: product.brand,
              brandSlug: product.brandSlug,
              price: product.price,
              salePrice: product.salePrice,
              image: product.image,
              rating: product.rating,
              reviewCount: product.reviewCount,
              isNew: product.isNew,
              isBestSeller: product.isBestSeller,
              isSale: product.isSale,
            }}
          />
        ))}
      </div>
    ) : (
      <div className="space-y-4">
        {displayedProducts.map((product) => (
          <div key={product.id} className="flex flex-col sm:flex-row gap-4 border rounded-lg p-4">
            <div className="sm:w-48 h-48 relative">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <h3 className="text-lg font-medium">
                <Link href={`/san-pham/${product.slug}`} className="hover:underline">
                  {product.name}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground">{product.brand}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm">⭐ {product.rating}</span>
                <span className="text-xs text-muted-foreground">({product.reviewCount} đánh giá)</span>
              </div>
              <div className="mt-auto pt-4">
                {product.salePrice ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.salePrice)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-medium">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                  </span>
                )}
                <div className="mt-2 flex gap-2">
                  <Button size="sm">Thêm vào giỏ</Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/san-pham/${product.slug}`}>Xem chi tiết</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-muted-foreground">
            Tìm thấy <span className="font-medium text-foreground">{products.length}</span> kết quả
            {query ? ` cho "${query}"` : ""}
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isDesktop && (
              <>
                {isTablet ? (
                  <Sheet open={openFilters} onOpenChange={setOpenFilters}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Bộ lọc
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                      <SearchFilters
                        query={query}
                        selectedCategory={searchParams.category as string}
                        selectedBrand={searchParams.brand as string}
                        selectedGender={searchParams.gender as string}
                        selectedPriceMin={searchParams.price_min as string}
                        selectedPriceMax={searchParams.price_max as string}
                        selectedRating={searchParams.rating as string}
                        onClose={() => setOpenFilters(false)}
                      />
                    </SheetContent>
                  </Sheet>
                ) : (
                  <Drawer open={openFilters} onOpenChange={setOpenFilters}>
                    <DrawerTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Bộ lọc
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <div className="px-4 py-6 max-h-[80vh] overflow-auto">
                        <SearchFilters
                          query={query}
                          selectedCategory={searchParams.category as string}
                          selectedBrand={searchParams.brand as string}
                          selectedGender={searchParams.gender as string}
                          selectedPriceMin={searchParams.price_min as string}
                          selectedPriceMax={searchParams.price_max as string}
                          selectedRating={searchParams.rating as string}
                          onClose={() => setOpenFilters(false)}
                        />
                      </div>
                    </DrawerContent>
                  </Drawer>
                )}
              </>
            )}

            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Độ liên quan</SelectItem>
                <SelectItem value="price-asc">Giá: Thấp đến cao</SelectItem>
                <SelectItem value="price-desc">Giá: Cao đến thấp</SelectItem>
                <SelectItem value="name-asc">Tên: A-Z</SelectItem>
                <SelectItem value="name-desc">Tên: Z-A</SelectItem>
                <SelectItem value="rating">Đánh giá: Cao nhất</SelectItem>
              </SelectContent>
            </Select>

            {!type || type === "products" ? (
              <div className="hidden sm:flex border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className={viewMode === "grid" ? "bg-muted" : ""}
                  onClick={() => setViewMode("grid")}
                  aria-label="Chế độ xem lưới"
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={viewMode === "list" ? "bg-muted" : ""}
                  onClick={() => setViewMode("list")}
                  aria-label="Chế độ xem danh sách"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Selected filters */}
        {getActiveFilters().length > 0 && (
          <SelectedFilters filters={getActiveFilters()} onRemove={removeFilter} onClearAll={clearAllFilters} />
        )}
      </div>

      {renderResults()}

      {totalPages > 1 && !type && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                onClick={() => handlePageChange(page > 1 ? page - 1 : 1)}
                isActive={false}
                disabled={page <= 1}
              >
                Trước
              </PaginationLink>
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i} className="hidden sm:inline-block">
                <PaginationLink onClick={() => handlePageChange(i + 1)} isActive={page === i + 1}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationLink
                onClick={() => handlePageChange(page < totalPages ? page + 1 : totalPages)}
                isActive={false}
                disabled={page >= totalPages}
              >
                Tiếp
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

