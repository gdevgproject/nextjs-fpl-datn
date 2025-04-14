"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"

// Define types based on the filter_products RPC
export type SortOption = "created_at" | "name" | "display_price" | "popularity"
export type SortOrder = "asc" | "desc"

export interface PlpFilters {
  brandIds: number[]
  categoryIds: number[]
  genderIds: number[]
  ingredientIds: number[]
  labelIds: number[]
  priceRange: {
    min: number | null
    max: number | null
  }
  volumeRange: {
    min: number | null
    max: number | null
  }
  releaseYearRange: {
    min: number | null
    max: number | null
  }
  onSale: boolean | null
  inStock: boolean | null
  originCountry: string | null
  searchTerm: string | null
  sortBy: SortOption
  sortOrder: SortOrder
  page: number
  pageSize: number
}

// Default filter values
const defaultFilters: PlpFilters = {
  brandIds: [],
  categoryIds: [],
  genderIds: [],
  ingredientIds: [],
  labelIds: [],
  priceRange: {
    min: null,
    max: null,
  },
  volumeRange: {
    min: null,
    max: null,
  },
  releaseYearRange: {
    min: null,
    max: null,
  },
  onSale: null,
  inStock: null,
  originCountry: null,
  searchTerm: null,
  sortBy: "created_at",
  sortOrder: "desc",
  page: 1,
  pageSize: 12,
}

// Parse search params to filter state
const parseSearchParams = (searchParams: { [key: string]: string | string[] | undefined }): PlpFilters => {
  const filters = { ...defaultFilters }

  // Parse array params
  const parseArrayParam = (param: string | string[] | undefined): number[] => {
    if (!param) return []
    if (typeof param === "string")
      return param
        .split(",")
        .map(Number)
        .filter((n) => !isNaN(n))
    return param.map(Number).filter((n) => !isNaN(n))
  }

  // Parse number params
  const parseNumberParam = (param: string | string[] | undefined): number | null => {
    if (!param) return null
    const value = typeof param === "string" ? param : param[0]
    const parsed = Number(value)
    return isNaN(parsed) ? null : parsed
  }

  // Parse boolean params
  const parseBooleanParam = (param: string | string[] | undefined): boolean | null => {
    if (!param) return null
    const value = typeof param === "string" ? param : param[0]
    if (value === "true") return true
    if (value === "false") return false
    return null
  }

  // Parse string params
  const parseStringParam = (param: string | string[] | undefined): string | null => {
    if (!param) return null
    return typeof param === "string" ? param : param[0] || null
  }

  // Parse sort params
  const parseSortParam = (param: string | string[] | undefined): SortOption => {
    const value = parseStringParam(param)
    const validOptions: SortOption[] = ["created_at", "name", "display_price", "popularity"]
    return validOptions.includes(value as SortOption) ? (value as SortOption) : defaultFilters.sortBy
  }

  const parseSortOrderParam = (param: string | string[] | undefined): SortOrder => {
    const value = parseStringParam(param)
    return value === "asc" ? "asc" : "desc"
  }

  // Apply all params
  filters.brandIds = parseArrayParam(searchParams.brands)
  filters.categoryIds = parseArrayParam(searchParams.categories)
  filters.genderIds = parseArrayParam(searchParams.genders)
  filters.ingredientIds = parseArrayParam(searchParams.ingredients)
  filters.labelIds = parseArrayParam(searchParams.labels)

  filters.priceRange.min = parseNumberParam(searchParams.minPrice)
  filters.priceRange.max = parseNumberParam(searchParams.maxPrice)

  filters.volumeRange.min = parseNumberParam(searchParams.minVolume)
  filters.volumeRange.max = parseNumberParam(searchParams.maxVolume)

  filters.releaseYearRange.min = parseNumberParam(searchParams.releaseYearMin)
  filters.releaseYearRange.max = parseNumberParam(searchParams.releaseYearMax)

  filters.onSale = parseBooleanParam(searchParams.onSale)
  filters.inStock = parseBooleanParam(searchParams.inStock)

  filters.originCountry = parseStringParam(searchParams.originCountry)
  filters.searchTerm = parseStringParam(searchParams.q)

  filters.sortBy = parseSortParam(searchParams.sortBy)
  filters.sortOrder = parseSortOrderParam(searchParams.sortOrder)

  filters.page = parseNumberParam(searchParams.page) || defaultFilters.page
  filters.pageSize = parseNumberParam(searchParams.pageSize) || defaultFilters.pageSize

  return filters
}

export function usePlpFilters(searchParams: { [key: string]: string | string[] | undefined }) {
  const router = useRouter()
  const pathname = usePathname()
  const [filters, setFilters] = useState<PlpFilters>(() => parseSearchParams(searchParams))

  // Count active filters (excluding pagination and sorting)
  const activeFilterCount = useMemo(() => {
    let count = 0

    count += filters.brandIds.length
    count += filters.categoryIds.length
    count += filters.genderIds.length
    count += filters.ingredientIds.length
    count += filters.labelIds.length

    if (filters.priceRange.min !== null) count++
    if (filters.priceRange.max !== null) count++

    if (filters.volumeRange.min !== null) count++
    if (filters.volumeRange.max !== null) count++

    if (filters.releaseYearRange.min !== null) count++
    if (filters.releaseYearRange.max !== null) count++

    if (filters.onSale !== null) count++
    if (filters.inStock !== null) count++

    if (filters.originCountry) count++
    if (filters.searchTerm) count++

    return count
  }, [filters])

  // Reset filters to default
  const resetFilters = useCallback(() => {
    setFilters({
      ...defaultFilters,
      searchTerm: filters.searchTerm, // Preserve search term
    })
  }, [filters.searchTerm])

  // Construct RPC filter params from filter state
  const constructRpcFilterParams = useCallback(() => {
    const p_filters: Record<string, any> = {}

    // Only add non-empty array filters
    if (filters.brandIds.length > 0) p_filters.brand_ids = filters.brandIds
    if (filters.categoryIds.length > 0) p_filters.category_ids = filters.categoryIds
    if (filters.genderIds.length > 0) p_filters.gender_ids = filters.genderIds
    if (filters.ingredientIds.length > 0) p_filters.ingredient_ids = filters.ingredientIds
    if (filters.labelIds.length > 0) p_filters.label_ids = filters.labelIds

    // Only add non-null numeric filters
    if (filters.priceRange.min !== null) p_filters.min_price = filters.priceRange.min
    if (filters.priceRange.max !== null) p_filters.max_price = filters.priceRange.max

    if (filters.volumeRange.min !== null) p_filters.min_volume = filters.volumeRange.min
    if (filters.volumeRange.max !== null) p_filters.max_volume = filters.volumeRange.max

    if (filters.releaseYearRange.min !== null) p_filters.release_year_min = filters.releaseYearRange.min
    if (filters.releaseYearRange.max !== null) p_filters.release_year_max = filters.releaseYearRange.max

    // Only add non-null boolean filters
    if (filters.onSale !== null) p_filters.on_sale = filters.onSale
    if (filters.inStock !== null) p_filters.in_stock = filters.inStock

    // Only add non-empty string filters
    if (filters.originCountry) p_filters.origin_country = filters.originCountry
    if (filters.searchTerm) p_filters.search_term = filters.searchTerm

    return {
      p_filters,
      p_page: filters.page,
      p_page_size: filters.pageSize,
      p_sort_by: filters.sortBy,
      p_sort_order: filters.sortOrder,
    }
  }, [filters])

  // Update URL based on current filters
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams()

    // Add array params
    if (filters.brandIds.length > 0) params.set("brands", filters.brandIds.join(","))
    if (filters.categoryIds.length > 0) params.set("categories", filters.categoryIds.join(","))
    if (filters.genderIds.length > 0) params.set("genders", filters.genderIds.join(","))
    if (filters.ingredientIds.length > 0) params.set("ingredients", filters.ingredientIds.join(","))
    if (filters.labelIds.length > 0) params.set("labels", filters.labelIds.join(","))

    // Add numeric params
    if (filters.priceRange.min !== null) params.set("minPrice", filters.priceRange.min.toString())
    if (filters.priceRange.max !== null) params.set("maxPrice", filters.priceRange.max.toString())

    if (filters.volumeRange.min !== null) params.set("minVolume", filters.volumeRange.min.toString())
    if (filters.volumeRange.max !== null) params.set("maxVolume", filters.volumeRange.max.toString())

    if (filters.releaseYearRange.min !== null) params.set("releaseYearMin", filters.releaseYearRange.min.toString())
    if (filters.releaseYearRange.max !== null) params.set("releaseYearMax", filters.releaseYearRange.max.toString())

    // Add boolean params
    if (filters.onSale !== null) params.set("onSale", filters.onSale.toString())
    if (filters.inStock !== null) params.set("inStock", filters.inStock.toString())

    // Add string params
    if (filters.originCountry) params.set("originCountry", filters.originCountry)
    if (filters.searchTerm) params.set("q", filters.searchTerm)

    // Add sort params
    if (filters.sortBy !== defaultFilters.sortBy) params.set("sortBy", filters.sortBy)
    if (filters.sortOrder !== defaultFilters.sortOrder) params.set("sortOrder", filters.sortOrder)

    // Add pagination params
    if (filters.page !== defaultFilters.page) params.set("page", filters.page.toString())
    if (filters.pageSize !== defaultFilters.pageSize) params.set("pageSize", filters.pageSize.toString())

    const queryString = params.toString()
    const url = queryString ? `${pathname}?${queryString}` : pathname

    router.replace(url, { scroll: false })
  }, [filters, pathname, router])

  return {
    filters,
    setFilters,
    resetFilters,
    constructRpcFilterParams,
    updateUrl,
    activeFilterCount,
  }
}
