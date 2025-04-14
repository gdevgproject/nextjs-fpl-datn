"use client"

import { usePlpFilters } from "../hooks/use-plp-filters"
import type { FilterOptions } from "../types/plp-types"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { formatCurrency } from "@/shared/lib/utils"

interface SelectedFiltersProps {
  filterOptions?: FilterOptions
}

export default function SelectedFilters({ filterOptions }: SelectedFiltersProps) {
  const { filters, removeFilter } = usePlpFilters()

  if (!filterOptions) return null

  const selectedFilters = []

  // Brand filters
  if (filters.brand_ids?.length) {
    filters.brand_ids.forEach((id) => {
      const brand = filterOptions.brands.find((b) => b.id === id)
      if (brand) {
        selectedFilters.push({
          key: "brand_ids",
          value: id,
          label: `Thương hiệu: ${brand.name}`,
        })
      }
    })
  }

  // Category filters
  if (filters.category_ids?.length) {
    filters.category_ids.forEach((id) => {
      const category = filterOptions.categories.find((c) => c.id === id)
      if (category) {
        selectedFilters.push({
          key: "category_ids",
          value: id,
          label: `Danh mục: ${category.name}`,
        })
      }
    })
  }

  // Gender filters
  if (filters.gender_ids?.length) {
    filters.gender_ids.forEach((id) => {
      const gender = filterOptions.genders.find((g) => g.id === id)
      if (gender) {
        selectedFilters.push({
          key: "gender_ids",
          value: id,
          label: `Giới tính: ${gender.name}`,
        })
      }
    })
  }

  // Ingredient filters
  if (filters.ingredient_ids?.length) {
    filters.ingredient_ids.forEach((id) => {
      const ingredient = filterOptions.ingredients.find((i) => i.id === id)
      if (ingredient) {
        selectedFilters.push({
          key: "ingredient_ids",
          value: id,
          label: `Thành phần: ${ingredient.name}`,
        })
      }
    })
  }

  // Label filters
  if (filters.label_ids?.length) {
    filters.label_ids.forEach((id) => {
      const label = filterOptions.labels.find((l) => l.id === id)
      if (label) {
        selectedFilters.push({
          key: "label_ids",
          value: id,
          label: `Nhãn: ${label.name}`,
        })
      }
    })
  }

  // Price range
  if (filters.min_price !== undefined || filters.max_price !== undefined) {
    const min = filters.min_price ?? filterOptions.price_range.min
    const max = filters.max_price ?? filterOptions.price_range.max
    selectedFilters.push({
      key: "price_range",
      label: `Giá: ${formatCurrency(min)} - ${formatCurrency(max)}`,
      onRemove: () => {
        removeFilter("min_price")
        removeFilter("max_price")
      },
    })
  }

  // Volume range
  if (filters.min_volume !== undefined || filters.max_volume !== undefined) {
    const volumes = filterOptions.volumes.map((v) => v.value).sort((a, b) => a - b)
    const min = filters.min_volume ?? Math.min(...volumes)
    const max = filters.max_volume ?? Math.max(...volumes)
    selectedFilters.push({
      key: "volume_range",
      label: `Dung tích: ${min}ml - ${max}ml`,
      onRemove: () => {
        removeFilter("min_volume")
        removeFilter("max_volume")
      },
    })
  }

  // Release year range
  if (filters.release_year_min !== undefined || filters.release_year_max !== undefined) {
    const years = filterOptions.release_years.map((y) => y.value).sort((a, b) => a - b)
    const min = filters.release_year_min ?? Math.min(...years)
    const max = filters.release_year_max ?? Math.max(...years)
    selectedFilters.push({
      key: "year_range",
      label: `Năm phát hành: ${min} - ${max}`,
      onRemove: () => {
        removeFilter("release_year_min")
        removeFilter("release_year_max")
      },
    })
  }

  // Origin country
  if (filters.origin_country) {
    selectedFilters.push({
      key: "origin_country",
      label: `Xuất xứ: ${filters.origin_country}`,
    })
  }

  // On sale
  if (filters.on_sale) {
    selectedFilters.push({
      key: "on_sale",
      label: "Đang giảm giá",
    })
  }

  // In stock
  if (filters.in_stock) {
    selectedFilters.push({
      key: "in_stock",
      label: "Còn hàng",
    })
  }

  // Search term
  if (filters.search_term) {
    selectedFilters.push({
      key: "search_term",
      label: `Tìm kiếm: ${filters.search_term}`,
    })
  }

  if (selectedFilters.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {selectedFilters.map((filter, index) => (
        <Badge key={`${filter.key}-${index}`} variant="secondary" className="px-2 py-1 gap-1">
          {filter.label}
          <button
            type="button"
            onClick={() => {
              if (filter.onRemove) {
                filter.onRemove()
              } else {
                removeFilter(filter.key as any, filter.value)
              }
            }}
            className="ml-1 rounded-full hover:bg-muted-foreground/20"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove</span>
          </button>
        </Badge>
      ))}
    </div>
  )
}
