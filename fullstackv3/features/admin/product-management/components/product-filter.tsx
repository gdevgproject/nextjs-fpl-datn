"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import type { ProductFilterData } from "./schemas"
import { useProductLookups } from "../queries"
import { Skeleton } from "@/components/ui/skeleton"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ProductFilterProps {
  filter: ProductFilterData
  onFilterChange: (newFilter: Partial<ProductFilterData>) => void
}

export function ProductFilter({ filter, onFilterChange }: ProductFilterProps) {
  const { data: lookups, isLoading } = useProductLookups()
  const [priceRange, setPriceRange] = useState({
    min: filter.min_price || "",
    max: filter.max_price || "",
  })

  // Handle checkbox filters (e.g., in_stock, has_promotion, deleted)
  const handleBooleanFilterChange = (key: keyof ProductFilterData, checked: boolean) => {
    onFilterChange({ [key]: checked || undefined })
  }

  // Handle price range filters
  const handlePriceRangeChange = (field: "min" | "max", value: string) => {
    const newRange = { ...priceRange, [field]: value }
    setPriceRange(newRange)
  }

  const applyPriceRange = () => {
    const min = priceRange.min === "" ? undefined : Number(priceRange.min)
    const max = priceRange.max === "" ? undefined : Number(priceRange.max)
    onFilterChange({
      min_price: min || null,
      max_price: max || null,
    })
  }

  // Handle label selection
  const handleLabelChange = (labelId: number, checked: boolean) => {
    const currentLabels = filter.labels || []
    if (checked) {
      onFilterChange({ labels: [...currentLabels, labelId] })
    } else {
      onFilterChange({
        labels: currentLabels.filter((id) => id !== labelId),
      })
    }
  }

  // Handle category selection
  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    const currentCategories = filter.categories || []
    if (checked) {
      onFilterChange({ categories: [...currentCategories, categoryId] })
    } else {
      onFilterChange({
        categories: currentCategories.filter((id) => id !== categoryId),
      })
    }
  }

  // Reset all filters
  const resetFilters = () => {
    setPriceRange({ min: "", max: "" })
    onFilterChange({
      brand_id: null,
      gender_id: null,
      categories: undefined,
      min_price: null,
      max_price: null,
      perfume_type_id: null,
      concentration_id: null,
      in_stock: undefined,
      has_promotion: undefined,
      labels: undefined,
      deleted: undefined,
      page: 1,
    })
  }

  // Count active filters (excluding pagination, sorting and search)
  const countActiveFilters = () => {
    let count = 0
    if (filter.brand_id) count++
    if (filter.gender_id) count++
    if (filter.categories && filter.categories.length > 0) count++
    if (filter.min_price) count++
    if (filter.max_price) count++
    if (filter.perfume_type_id) count++
    if (filter.concentration_id) count++
    if (filter.in_stock) count++
    if (filter.has_promotion) count++
    if (filter.labels && filter.labels.length > 0) count++
    if (filter.deleted) count++
    return count
  }

  // Display selected filter summary
  const renderFilterSummary = () => {
    const activeFilters = countActiveFilters()
    if (activeFilters === 0) return null

    return (
      <div className="flex flex-wrap gap-2 mb-4 mt-2">
        {filter.brand_id && lookups?.brands && (
          <FilterBadge
            label={`Thương hiệu: ${lookups.brands.find((b) => b.id === filter.brand_id)?.name || ""}`}
            onRemove={() => onFilterChange({ brand_id: null })}
          />
        )}
        {filter.gender_id && lookups?.genders && (
          <FilterBadge
            label={`Giới tính: ${lookups.genders.find((g) => g.id === filter.gender_id)?.name || ""}`}
            onRemove={() => onFilterChange({ gender_id: null })}
          />
        )}
        {filter.perfume_type_id && lookups?.perfumeTypes && (
          <FilterBadge
            label={`Loại: ${lookups.perfumeTypes.find((t) => t.id === filter.perfume_type_id)?.name || ""}`}
            onRemove={() => onFilterChange({ perfume_type_id: null })}
          />
        )}
        {filter.concentration_id && lookups?.concentrations && (
          <FilterBadge
            label={`Nồng độ: ${lookups.concentrations.find((c) => c.id === filter.concentration_id)?.name || ""}`}
            onRemove={() => onFilterChange({ concentration_id: null })}
          />
        )}
        {filter.min_price && (
          <FilterBadge
            label={`Giá từ: ${filter.min_price.toLocaleString()}đ`}
            onRemove={() => onFilterChange({ min_price: null })}
          />
        )}
        {filter.max_price && (
          <FilterBadge
            label={`Giá đến: ${filter.max_price.toLocaleString()}đ`}
            onRemove={() => onFilterChange({ max_price: null })}
          />
        )}
        {filter.in_stock && <FilterBadge label="Còn hàng" onRemove={() => onFilterChange({ in_stock: undefined })} />}
        {filter.has_promotion && (
          <FilterBadge label="Có khuyến mãi" onRemove={() => onFilterChange({ has_promotion: undefined })} />
        )}
        {filter.deleted && <FilterBadge label="Đã ẩn" onRemove={() => onFilterChange({ deleted: undefined })} />}
        {filter.categories && filter.categories.length > 0 && lookups?.categories && (
          <FilterBadge
            label={`Danh mục: ${filter.categories.length}`}
            onRemove={() => onFilterChange({ categories: undefined })}
          />
        )}
        {filter.labels && filter.labels.length > 0 && lookups?.productLabels && (
          <FilterBadge label={`Nhãn: ${filter.labels.length}`} onRemove={() => onFilterChange({ labels: undefined })} />
        )}
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={resetFilters}>
          Đặt lại tất cả
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-card border rounded-md p-4 shadow-sm">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-8 w-2/3" />
        </div>
      ) : (
        <>
          {renderFilterSummary()}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Brand Filter */}
            <div className="space-y-2">
              <Label htmlFor="brand">Thương hiệu</Label>
              <Select
                value={filter.brand_id?.toString() || ""}
                onValueChange={(value) =>
                  onFilterChange({
                    brand_id: value ? Number(value) : null,
                  })
                }
              >
                <SelectTrigger id="brand">
                  <SelectValue placeholder="Tất cả thương hiệu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả thương hiệu</SelectItem>
                  {lookups?.brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gender Filter */}
            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính</Label>
              <Select
                value={filter.gender_id?.toString() || ""}
                onValueChange={(value) =>
                  onFilterChange({
                    gender_id: value ? Number(value) : null,
                  })
                }
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Tất cả giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả giới tính</SelectItem>
                  {lookups?.genders.map((gender) => (
                    <SelectItem key={gender.id} value={gender.id.toString()}>
                      {gender.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Perfume Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="perfume-type">Loại nước hoa</Label>
              <Select
                value={filter.perfume_type_id?.toString() || ""}
                onValueChange={(value) =>
                  onFilterChange({
                    perfume_type_id: value ? Number(value) : null,
                  })
                }
              >
                <SelectTrigger id="perfume-type">
                  <SelectValue placeholder="Tất cả loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả loại</SelectItem>
                  {lookups?.perfumeTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Concentration Filter */}
            <div className="space-y-2">
              <Label htmlFor="concentration">Nồng độ</Label>
              <Select
                value={filter.concentration_id?.toString() || ""}
                onValueChange={(value) =>
                  onFilterChange({
                    concentration_id: value ? Number(value) : null,
                  })
                }
              >
                <SelectTrigger id="concentration">
                  <SelectValue placeholder="Tất cả nồng độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả nồng độ</SelectItem>
                  {lookups?.concentrations.map((concentration) => (
                    <SelectItem key={concentration.id} value={concentration.id.toString()}>
                      {concentration.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <Label>Khoảng giá</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Từ"
                  value={priceRange.min}
                  onChange={(e) => handlePriceRangeChange("min", e.target.value)}
                  className="w-full"
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder="Đến"
                  value={priceRange.max}
                  onChange={(e) => handlePriceRangeChange("max", e.target.value)}
                  className="w-full"
                />
                <Button type="button" size="sm" variant="outline" onClick={applyPriceRange}>
                  Áp dụng
                </Button>
              </div>
            </div>

            {/* Stock and Promotion Filters */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={!!filter.in_stock}
                  onCheckedChange={(checked) => handleBooleanFilterChange("in_stock", !!checked)}
                />
                <Label htmlFor="in-stock" className="cursor-pointer">
                  Còn hàng
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-promotion"
                  checked={!!filter.has_promotion}
                  onCheckedChange={(checked) => handleBooleanFilterChange("has_promotion", !!checked)}
                />
                <Label htmlFor="has-promotion" className="cursor-pointer">
                  Có khuyến mãi
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="deleted"
                  checked={!!filter.deleted}
                  onCheckedChange={(checked) => handleBooleanFilterChange("deleted", !!checked)}
                />
                <Label htmlFor="deleted" className="cursor-pointer">
                  Đã ẩn
                </Label>
              </div>
            </div>
          </div>

          <Accordion type="single" collapsible className="mt-4">
            {/* Categories Accordion */}
            <AccordionItem value="categories">
              <AccordionTrigger>Danh mục sản phẩm</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {lookups?.categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={filter.categories?.includes(category.id) || false}
                        onCheckedChange={(checked) => handleCategoryChange(category.id, !!checked)}
                      />
                      <Label htmlFor={`category-${category.id}`} className="cursor-pointer">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Labels Accordion */}
            <AccordionItem value="labels">
              <AccordionTrigger>Nhãn sản phẩm</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {lookups?.productLabels.map((label) => (
                    <div key={label.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`label-${label.id}`}
                        checked={filter.labels?.includes(label.id) || false}
                        onCheckedChange={(checked) => handleLabelChange(label.id, !!checked)}
                      />
                      <Label htmlFor={`label-${label.id}`} className="cursor-pointer">
                        {label.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={resetFilters} className="mr-2" size="sm">
              Đặt lại
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

// Helper component for selected filter badges
function FilterBadge({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <Badge variant="secondary" className="flex items-center gap-1 h-7 px-2 text-xs">
      {label}
      <X
        className="h-3 w-3 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
      />
    </Badge>
  )
}

