"use client"

import { useState, useEffect } from "react"
import { useFilterOptions } from "../hooks/use-filter-options"
import { usePlpFilters } from "../hooks/use-plp-filters"
import { useProductList } from "../hooks/use-product-list"
import FilterSidebar from "./filter-sidebar"
import MobileFilterDrawer from "./mobile-filter-drawer"
import ProductGrid from "./product-grid"
import SelectedFilters from "./selected-filters"
import SortDropdown from "./sort-dropdown"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Filter } from "lucide-react"
import ProductListSkeleton from "./product-list-skeleton"
import NoResults from "./no-results"
import Pagination from "./pagination"

interface ProductListPageProps {
  initialCategoryId?: number
  initialGenderId?: number
  initialBrandId?: number
}

export default function ProductListPage({ initialCategoryId, initialGenderId, initialBrandId }: ProductListPageProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const {
    filters,
    page,
    pageSize,
    sortBy,
    sortOrder,
    activeFilterCount,
    rpcParams,
    updateFilters,
    updateSort,
    clearFilters,
  } = usePlpFilters()

  // Apply initial filters if provided
  useEffect(() => {
    const newFilters = { ...filters }
    let shouldUpdate = false

    // Apply initial category filter
    if (initialCategoryId && !filters.category_ids?.includes(initialCategoryId)) {
      newFilters.category_ids = [...(filters.category_ids || []), initialCategoryId]
      shouldUpdate = true
    }

    // Apply initial gender filter
    if (initialGenderId && !filters.gender_ids?.includes(initialGenderId)) {
      newFilters.gender_ids = [...(filters.gender_ids || []), initialGenderId]
      shouldUpdate = true
    }

    // Apply initial brand filter
    if (initialBrandId && !filters.brand_ids?.includes(initialBrandId)) {
      newFilters.brand_ids = [...(filters.brand_ids || []), initialBrandId]
      shouldUpdate = true
    }

    if (shouldUpdate) {
      updateFilters(newFilters, false)
    }
  }, [initialCategoryId, initialGenderId, initialBrandId])

  const { data: filterOptions, isLoading: isLoadingOptions } = useFilterOptions()
  const { data: products, isLoading: isLoadingProducts, isError } = useProductList(rpcParams)

  const totalCount = products?.[0]?.total_count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  const handleOpenMobileFilters = () => setMobileFiltersOpen(true)
  const handleCloseMobileFilters = () => setMobileFiltersOpen(false)

  // Get category, gender, or brand name if provided
  const categoryName =
    initialCategoryId && filterOptions
      ? filterOptions.categories.find((c) => c.id === initialCategoryId)?.name
      : undefined

  const genderName =
    initialGenderId && filterOptions ? filterOptions.genders.find((g) => g.id === initialGenderId)?.name : undefined

  const brandName =
    initialBrandId && filterOptions ? filterOptions.brands.find((b) => b.id === initialBrandId)?.name : undefined

  // Determine page title
  let pageTitle = "Sản phẩm"
  if (brandName) {
    pageTitle = brandName
  } else if (genderName) {
    pageTitle = `Nước hoa ${genderName}`
  } else if (categoryName) {
    pageTitle = categoryName
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{pageTitle}</h1>
            <p className="text-muted-foreground">
              {isLoadingProducts
                ? "Đang tải sản phẩm..."
                : `Hiển thị ${products?.length || 0} trên ${totalCount} sản phẩm`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="md:hidden flex items-center gap-2"
              onClick={handleOpenMobileFilters}
            >
              <Filter className="h-4 w-4" />
              Lọc
              {activeFilterCount > 0 && (
                <span className="ml-1 rounded-full bg-primary text-primary-foreground w-5 h-5 text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            <SortDropdown sortBy={sortBy} sortOrder={sortOrder} onSortChange={updateSort} />
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex flex-col space-y-2">
            <SelectedFilters filterOptions={filterOptions} />
            <Button variant="link" size="sm" className="w-fit px-0" onClick={clearFilters}>
              Xóa tất cả bộ lọc
            </Button>
          </div>
        )}

        <Separator className="my-2" />

        <div className="flex flex-col md:flex-row gap-6">
          <div className="hidden md:block w-64 flex-shrink-0">
            <FilterSidebar filterOptions={filterOptions} isLoading={isLoadingOptions} />
          </div>

          <div className="flex-1">
            {isLoadingProducts && <ProductListSkeleton />}

            {!isLoadingProducts && products?.length === 0 && <NoResults onClearFilters={clearFilters} />}

            {!isLoadingProducts && products && products.length > 0 && (
              <>
                <ProductGrid products={products} />

                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination currentPage={page} totalPages={totalPages} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <MobileFilterDrawer
        open={mobileFiltersOpen}
        onClose={handleCloseMobileFilters}
        filterOptions={filterOptions}
        isLoading={isLoadingOptions}
      />
    </div>
  )
}
