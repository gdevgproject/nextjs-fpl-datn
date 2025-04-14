"use client"

import { useState, useEffect } from "react"
import { usePlpFilters } from "../hooks/use-plp-filters"
import { useProducts } from "../hooks/use-products"
import { FilterSidebar } from "./filter-sidebar"
import { ProductGrid } from "./product-grid"
import { ProductListHeader } from "./product-list-header"
import { Pagination } from "./pagination"
import { NoResults } from "./no-results"
import { ProductListingSkeleton } from "./product-listing-skeleton"

interface ProductListingPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export function ProductListingPage({ searchParams }: ProductListingPageProps) {
  const { filters, setFilters, resetFilters, constructRpcFilterParams, updateUrl, activeFilterCount } =
    usePlpFilters(searchParams)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Construct RPC params from filters
  const rpcParams = constructRpcFilterParams()

  // Fetch products
  const { data: products, isLoading, isError } = useProducts(rpcParams)

  // Get total count from the first product (if available)
  const totalCount = products && products.length > 0 ? products[0]?.total_count || 0 : 0

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / filters.pageSize)

  // Update URL when filters change
  useEffect(() => {
    if (!isInitialLoad) {
      updateUrl()
    } else {
      setIsInitialLoad(false)
    }
  }, [filters, isInitialLoad, updateUrl])

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }))
  }

  // Handle sort change
  const handleSortChange = (sortBy: string, sortOrder: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      page: 1, // Reset to first page when sort changes
    }))
  }

  return (
    <div className="container px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Sản phẩm</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-1/4">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            activeFilterCount={activeFilterCount}
          />
        </div>

        {/* Main content */}
        <div className="w-full lg:w-3/4">
          <ProductListHeader
            totalCount={totalCount}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSortChange={handleSortChange}
          />

          {isLoading ? (
            <ProductListingSkeleton />
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-red-500">Đã xảy ra lỗi khi tải sản phẩm. Vui lòng thử lại sau.</p>
            </div>
          ) : products && products.length > 0 ? (
            <>
              <ProductGrid products={products} />

              {totalPages > 1 && (
                <Pagination currentPage={filters.page} totalPages={totalPages} onPageChange={handlePageChange} />
              )}
            </>
          ) : (
            <NoResults searchTerm={filters.searchTerm} onReset={resetFilters} />
          )}
        </div>
      </div>
    </div>
  )
}
