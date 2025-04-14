"use client"

import { useCallback, useEffect, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDebounce } from "@/features/admin/brands/hooks/use-debounce"
import type { ProductFilters, SortOption, SortOrder } from "../types/plp-types"

// Default values
const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 24
const DEFAULT_SORT_BY: SortOption = "popularity"
const DEFAULT_SORT_ORDER: SortOrder = "desc"

export function usePlpFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Parse current search params
  const page = Number(searchParams.get("page") || DEFAULT_PAGE)
  const pageSize = Number(searchParams.get("pageSize") || DEFAULT_PAGE_SIZE)
  const sortBy = (searchParams.get("sortBy") as SortOption) || DEFAULT_SORT_BY
  const sortOrder = (searchParams.get("sortOrder") as SortOrder) || DEFAULT_SORT_ORDER

  // Parse filter values from URL
  const filters: ProductFilters = useMemo(() => {
    const result: ProductFilters = {}

    // Array parameters
    const arrayParams = ["brand_ids", "category_ids", "gender_ids", "ingredient_ids", "label_ids"]
    arrayParams.forEach((param) => {
      const value = searchParams.get(param)
      if (value) {
        result[param as keyof ProductFilters] = value.split(",").map(Number)
      }
    })

    // Number parameters
    const numberParams = ["min_price", "max_price", "min_volume", "max_volume", "release_year_min", "release_year_max"]
    numberParams.forEach((param) => {
      const value = searchParams.get(param)
      if (value) {
        result[param as keyof ProductFilters] = Number(value)
      }
    })

    // Boolean parameters
    const booleanParams = ["on_sale", "in_stock"]
    booleanParams.forEach((param) => {
      const value = searchParams.get(param)
      if (value !== null) {
        result[param as keyof ProductFilters] = value === "true"
      }
    })

    // String parameters
    const stringParams = ["search_term", "origin_country"]
    stringParams.forEach((param) => {
      const value = searchParams.get(param)
      if (value) {
        result[param as keyof ProductFilters] = value
      }
    })

    return result
  }, [searchParams])

  // Debounce search term to avoid excessive URL updates
  const debouncedSearchTerm = useDebounce(filters.search_term || "", 500)

  // Update URL when debounced search term changes
  useEffect(() => {
    if (filters.search_term !== debouncedSearchTerm) {
      updateFilters({ ...filters, search_term: debouncedSearchTerm || undefined })
    }
  }, [debouncedSearchTerm])

  // Create URL search params from current state
  const createSearchParams = useCallback(
    (
      newFilters: ProductFilters,
      newPage = page,
      newPageSize = pageSize,
      newSortBy = sortBy,
      newSortOrder = sortOrder,
    ) => {
      const params = new URLSearchParams()

      // Add pagination and sorting
      if (newPage !== DEFAULT_PAGE) params.set("page", newPage.toString())
      if (newPageSize !== DEFAULT_PAGE_SIZE) params.set("pageSize", newPageSize.toString())
      if (newSortBy !== DEFAULT_SORT_BY) params.set("sortBy", newSortBy)
      if (newSortOrder !== DEFAULT_SORT_ORDER) params.set("sortOrder", newSortOrder)

      // Add array filters
      if (newFilters.brand_ids?.length) params.set("brand_ids", newFilters.brand_ids.join(","))
      if (newFilters.category_ids?.length) params.set("category_ids", newFilters.category_ids.join(","))
      if (newFilters.gender_ids?.length) params.set("gender_ids", newFilters.gender_ids.join(","))
      if (newFilters.ingredient_ids?.length) params.set("ingredient_ids", newFilters.ingredient_ids.join(","))
      if (newFilters.label_ids?.length) params.set("label_ids", newFilters.label_ids.join(","))

      // Add number filters
      if (newFilters.min_price !== undefined) params.set("min_price", newFilters.min_price.toString())
      if (newFilters.max_price !== undefined) params.set("max_price", newFilters.max_price.toString())
      if (newFilters.min_volume !== undefined) params.set("min_volume", newFilters.min_volume.toString())
      if (newFilters.max_volume !== undefined) params.set("max_volume", newFilters.max_volume.toString())
      if (newFilters.release_year_min !== undefined)
        params.set("release_year_min", newFilters.release_year_min.toString())
      if (newFilters.release_year_max !== undefined)
        params.set("release_year_max", newFilters.release_year_max.toString())

      // Add boolean filters
      if (newFilters.on_sale !== undefined) params.set("on_sale", newFilters.on_sale.toString())
      if (newFilters.in_stock !== undefined) params.set("in_stock", newFilters.in_stock.toString())

      // Add string filters
      if (newFilters.search_term) params.set("search_term", newFilters.search_term)
      if (newFilters.origin_country) params.set("origin_country", newFilters.origin_country)

      return params
    },
    [page, pageSize, sortBy, sortOrder],
  )

  // Update filters in URL
  const updateFilters = useCallback(
    (newFilters: ProductFilters, resetPage = true) => {
      const newPage = resetPage ? DEFAULT_PAGE : page
      const params = createSearchParams(newFilters, newPage, pageSize, sortBy, sortOrder)
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, createSearchParams, page, pageSize, sortBy, sortOrder],
  )

  // Update pagination
  const updatePage = useCallback(
    (newPage: number) => {
      const params = createSearchParams(filters, newPage, pageSize, sortBy, sortOrder)
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, createSearchParams, filters, pageSize, sortBy, sortOrder],
  )

  // Update page size
  const updatePageSize = useCallback(
    (newPageSize: number) => {
      const params = createSearchParams(filters, DEFAULT_PAGE, newPageSize, sortBy, sortOrder)
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, createSearchParams, filters, sortBy, sortOrder],
  )

  // Update sorting
  const updateSort = useCallback(
    (newSortBy: SortOption, newSortOrder: SortOrder) => {
      const params = createSearchParams(filters, page, pageSize, newSortBy, newSortOrder)
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, createSearchParams, filters, page, pageSize],
  )

  // Toggle a single filter value
  const toggleFilter = useCallback(
    (key: keyof ProductFilters, value: any) => {
      const newFilters = { ...filters }

      // Handle array filters
      if (
        ["brand_ids", "category_ids", "gender_ids", "ingredient_ids", "label_ids"].includes(key) &&
        Array.isArray(newFilters[key])
      ) {
        const array = newFilters[key] as number[]
        const index = array.indexOf(value)
        if (index >= 0) {
          array.splice(index, 1)
        } else {
          array.push(value)
        }
        if (array.length === 0) {
          delete newFilters[key]
        }
      }
      // Handle boolean filters
      else if (["on_sale", "in_stock"].includes(key)) {
        if (newFilters[key] === value) {
          delete newFilters[key]
        } else {
          newFilters[key] = value
        }
      }
      // Handle other filters
      else {
        if (newFilters[key] === value) {
          delete newFilters[key]
        } else {
          newFilters[key] = value
        }
      }

      updateFilters(newFilters)
    },
    [filters, updateFilters],
  )

  // Set a range filter
  const setRangeFilter = useCallback(
    (minKey: keyof ProductFilters, maxKey: keyof ProductFilters, minValue?: number, maxValue?: number) => {
      const newFilters = { ...filters }

      if (minValue !== undefined) {
        newFilters[minKey] = minValue
      } else {
        delete newFilters[minKey]
      }

      if (maxValue !== undefined) {
        newFilters[maxKey] = maxValue
      } else {
        delete newFilters[maxKey]
      }

      updateFilters(newFilters)
    },
    [filters, updateFilters],
  )

  // Clear all filters
  const clearFilters = useCallback(() => {
    const params = createSearchParams({}, DEFAULT_PAGE, pageSize, sortBy, sortOrder)
    router.push(`${pathname}?${params.toString()}`)
  }, [pathname, router, createSearchParams, pageSize, sortBy, sortOrder])

  // Remove a single filter
  const removeFilter = useCallback(
    (key: keyof ProductFilters, value?: any) => {
      const newFilters = { ...filters }

      // For array filters, remove specific value
      if (
        ["brand_ids", "category_ids", "gender_ids", "ingredient_ids", "label_ids"].includes(key) &&
        Array.isArray(newFilters[key]) &&
        value !== undefined
      ) {
        const array = newFilters[key] as number[]
        const index = array.indexOf(value)
        if (index >= 0) {
          array.splice(index, 1)
          if (array.length === 0) {
            delete newFilters[key]
          }
        }
      }
      // For other filters, remove the entire key
      else {
        delete newFilters[key]
      }

      updateFilters(newFilters)
    },
    [filters, updateFilters],
  )

  // Check if a filter is active
  const isFilterActive = useCallback(
    (key: keyof ProductFilters, value?: any): boolean => {
      if (!filters[key]) return false

      // For array filters, check if value is in array
      if (
        ["brand_ids", "category_ids", "gender_ids", "ingredient_ids", "label_ids"].includes(key) &&
        value !== undefined
      ) {
        return (filters[key] as number[]).includes(value)
      }

      // For boolean filters
      if (["on_sale", "in_stock"].includes(key)) {
        return filters[key] === true
      }

      // For other filters, just check if they exist
      return filters[key] !== undefined
    },
    [filters],
  )

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0

    // Count array filters
    const arrayFilters = ["brand_ids", "category_ids", "gender_ids", "ingredient_ids", "label_ids"]
    arrayFilters.forEach((key) => {
      const array = filters[key as keyof ProductFilters] as number[] | undefined
      if (array?.length) count += array.length
    })

    // Count range filters (min/max pairs count as 1)
    if (filters.min_price !== undefined || filters.max_price !== undefined) count++
    if (filters.min_volume !== undefined || filters.max_volume !== undefined) count++
    if (filters.release_year_min !== undefined || filters.release_year_max !== undefined) count++

    // Count boolean filters
    if (filters.on_sale !== undefined) count++
    if (filters.in_stock !== undefined) count++

    // Count string filters
    if (filters.search_term) count++
    if (filters.origin_country) count++

    return count
  }, [filters])

  // Prepare RPC parameters
  const rpcParams = useMemo(() => {
    return {
      p_filters: filters,
      p_page: page - 1, // Convert to 0-based for backend
      p_page_size: pageSize,
      p_sort_by: sortBy,
      p_sort_order: sortOrder,
    }
  }, [filters, page, pageSize, sortBy, sortOrder])

  return {
    // Current state
    filters,
    page,
    pageSize,
    sortBy,
    sortOrder,
    activeFilterCount,
    rpcParams,

    // Actions
    updateFilters,
    updatePage,
    updatePageSize,
    updateSort,
    toggleFilter,
    setRangeFilter,
    clearFilters,
    removeFilter,
    isFilterActive,
  }
}
