"use client"

import type React from "react"

import { useState } from "react"
import { useClientRpcQuery } from "@/shared/hooks/use-client-rpc"
import type { PlpFilters } from "../hooks/use-plp-filters"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { X, Filter } from "lucide-react"

// Define filter option types
interface FilterOption {
  id: number
  name: string
  count?: number
}

interface FilterOptions {
  brands?: FilterOption[]
  categories?: FilterOption[]
  genders?: FilterOption[]
  ingredients?: FilterOption[]
  labels?: FilterOption[]
  price_range?: { min: number; max: number }
  volume_range?: { min: number; max: number }
  release_years?: { min: number; max: number }
  origin_countries?: { name: string; count: number }[]
}

export function FilterSidebar({
  filters,
  setFilters,
  resetFilters,
  activeFilterCount,
}: {
  filters: PlpFilters
  setFilters: React.Dispatch<React.SetStateAction<PlpFilters>>
  resetFilters: () => void
  activeFilterCount: number
}) {
  const [isOpen, setIsOpen] = useState(false)

  // Fetch filter options
  const { data: filterOptions, isLoading } = useClientRpcQuery<"get_plp_filter_options", {}, FilterOptions>(
    "get_plp_filter_options",
    {},
    {
      staleTime: 1000 * 60 * 10, // 10 minutes
    },
  )

  // Handle checkbox filters (brands, categories, etc.)
  const handleArrayFilterChange = (
    filterName: keyof Pick<PlpFilters, "brandIds" | "categoryIds" | "genderIds" | "ingredientIds" | "labelIds">,
    id: number,
    checked: boolean,
  ) => {
    setFilters((prev) => {
      const currentIds = [...prev[filterName]]

      if (checked) {
        // Add id if not already in the array
        if (!currentIds.includes(id)) {
          return {
            ...prev,
            [filterName]: [...currentIds, id],
            page: 1, // Reset to first page when filter changes
          }
        }
      } else {
        // Remove id if it exists in the array
        return {
          ...prev,
          [filterName]: currentIds.filter((currentId) => currentId !== id),
          page: 1, // Reset to first page when filter changes
        }
      }

      return prev
    })
  }

  // Handle price range change
  const handlePriceRangeChange = (values: number[]) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: {
        min: values[0],
        max: values[1],
      },
      page: 1, // Reset to first page when filter changes
    }))
  }

  // Handle volume range change
  const handleVolumeRangeChange = (values: number[]) => {
    setFilters((prev) => ({
      ...prev,
      volumeRange: {
        min: values[0],
        max: values[1],
      },
      page: 1, // Reset to first page when filter changes
    }))
  }

  // Handle release year range change
  const handleReleaseYearRangeChange = (values: number[]) => {
    setFilters((prev) => ({
      ...prev,
      releaseYearRange: {
        min: values[0],
        max: values[1],
      },
      page: 1, // Reset to first page when filter changes
    }))
  }

  // Handle on sale change
  const handleOnSaleChange = (checked: boolean | "indeterminate") => {
    if (typeof checked === "boolean") {
      setFilters((prev) => ({
        ...prev,
        onSale: checked ? true : null,
        page: 1, // Reset to first page when filter changes
      }))
    }
  }

  // Handle in stock change
  const handleInStockChange = (checked: boolean | "indeterminate") => {
    if (typeof checked === "boolean") {
      setFilters((prev) => ({
        ...prev,
        inStock: checked ? true : null,
        page: 1, // Reset to first page when filter changes
      }))
    }
  }

  // Handle origin country change
  const handleOriginCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    setFilters((prev) => ({
      ...prev,
      originCountry: value || null,
      page: 1, // Reset to first page when filter changes
    }))
  }

  // Filter content component
  const filterContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Bộ lọc</h2>

        {activeFilterCount > 0 && (
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4 mr-2" />
            Xóa tất cả
          </Button>
        )}
      </div>

      <Separator />

      <Accordion type="multiple" defaultValue={["brands", "categories", "price"]}>
        {/* Brands filter */}
        <AccordionItem value="brands">
          <AccordionTrigger>Thương hiệu</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Đang tải...</div>
              ) : filterOptions?.brands && filterOptions.brands.length > 0 ? (
                filterOptions.brands.map((brand) => (
                  <div key={brand.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand.id}`}
                      checked={filters.brandIds.includes(brand.id)}
                      onCheckedChange={(checked) => handleArrayFilterChange("brandIds", brand.id, checked as boolean)}
                    />
                    <Label htmlFor={`brand-${brand.id}`} className="text-sm flex-1 cursor-pointer">
                      {brand.name}
                    </Label>
                    {brand.count !== undefined && (
                      <span className="text-xs text-muted-foreground">({brand.count})</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">Không có dữ liệu</div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Categories filter */}
        <AccordionItem value="categories">
          <AccordionTrigger>Danh mục</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Đang tải...</div>
              ) : filterOptions?.categories && filterOptions.categories.length > 0 ? (
                filterOptions.categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.categoryIds.includes(category.id)}
                      onCheckedChange={(checked) =>
                        handleArrayFilterChange("categoryIds", category.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`category-${category.id}`} className="text-sm flex-1 cursor-pointer">
                      {category.name}
                    </Label>
                    {category.count !== undefined && (
                      <span className="text-xs text-muted-foreground">({category.count})</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">Không có dữ liệu</div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Genders filter */}
        <AccordionItem value="genders">
          <AccordionTrigger>Giới tính</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Đang tải...</div>
              ) : filterOptions?.genders && filterOptions.genders.length > 0 ? (
                filterOptions.genders.map((gender) => (
                  <div key={gender.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`gender-${gender.id}`}
                      checked={filters.genderIds.includes(gender.id)}
                      onCheckedChange={(checked) => handleArrayFilterChange("genderIds", gender.id, checked as boolean)}
                    />
                    <Label htmlFor={`gender-${gender.id}`} className="text-sm flex-1 cursor-pointer">
                      {gender.name}
                    </Label>
                    {gender.count !== undefined && (
                      <span className="text-xs text-muted-foreground">({gender.count})</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">Không có dữ liệu</div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price range filter */}
        <AccordionItem value="price">
          <AccordionTrigger>Giá</AccordionTrigger>
          <AccordionContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Đang tải...</div>
            ) : filterOptions?.price_range ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>
                    {filters.priceRange.min !== null
                      ? new Intl.NumberFormat("vi-VN").format(filters.priceRange.min)
                      : new Intl.NumberFormat("vi-VN").format(filterOptions.price_range.min)}
                    đ
                  </span>
                  <span>
                    {filters.priceRange.max !== null
                      ? new Intl.NumberFormat("vi-VN").format(filters.priceRange.max)
                      : new Intl.NumberFormat("vi-VN").format(filterOptions.price_range.max)}
                    đ
                  </span>
                </div>

                <Slider
                  defaultValue={[
                    filters.priceRange.min ?? filterOptions.price_range.min,
                    filters.priceRange.max ?? filterOptions.price_range.max,
                  ]}
                  min={filterOptions.price_range.min}
                  max={filterOptions.price_range.max}
                  step={10000}
                  onValueCommit={handlePriceRangeChange}
                />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Không có dữ liệu</div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Volume range filter */}
        <AccordionItem value="volume">
          <AccordionTrigger>Dung tích (ml)</AccordionTrigger>
          <AccordionContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Đang tải...</div>
            ) : filterOptions?.volume_range ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>
                    {filters.volumeRange.min !== null ? filters.volumeRange.min : filterOptions.volume_range.min}
                    ml
                  </span>
                  <span>
                    {filters.volumeRange.max !== null ? filters.volumeRange.max : filterOptions.volume_range.max}
                    ml
                  </span>
                </div>

                <Slider
                  defaultValue={[
                    filters.volumeRange.min ?? filterOptions.volume_range.min,
                    filters.volumeRange.max ?? filterOptions.volume_range.max,
                  ]}
                  min={filterOptions.volume_range.min}
                  max={filterOptions.volume_range.max}
                  step={5}
                  onValueCommit={handleVolumeRangeChange}
                />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Không có dữ liệu</div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Release year range filter */}
        <AccordionItem value="releaseYear">
          <AccordionTrigger>Năm phát hành</AccordionTrigger>
          <AccordionContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Đang tải...</div>
            ) : filterOptions?.release_years ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>
                    {filters.releaseYearRange.min !== null
                      ? filters.releaseYearRange.min
                      : filterOptions.release_years.min}
                  </span>
                  <span>
                    {filters.releaseYearRange.max !== null
                      ? filters.releaseYearRange.max
                      : filterOptions.release_years.max}
                  </span>
                </div>

                <Slider
                  defaultValue={[
                    filters.releaseYearRange.min ?? filterOptions.release_years.min,
                    filters.releaseYearRange.max ?? filterOptions.release_years.max,
                  ]}
                  min={filterOptions.release_years.min}
                  max={filterOptions.release_years.max}
                  step={1}
                  onValueCommit={handleReleaseYearRangeChange}
                />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Không có dữ liệu</div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Ingredients filter */}
        <AccordionItem value="ingredients">
          <AccordionTrigger>Thành phần</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Đang tải...</div>
              ) : filterOptions?.ingredients && filterOptions.ingredients.length > 0 ? (
                filterOptions.ingredients.map((ingredient) => (
                  <div key={ingredient.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`ingredient-${ingredient.id}`}
                      checked={filters.ingredientIds.includes(ingredient.id)}
                      onCheckedChange={(checked) =>
                        handleArrayFilterChange("ingredientIds", ingredient.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`ingredient-${ingredient.id}`} className="text-sm flex-1 cursor-pointer">
                      {ingredient.name}
                    </Label>
                    {ingredient.count !== undefined && (
                      <span className="text-xs text-muted-foreground">({ingredient.count})</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">Không có dữ liệu</div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Labels filter */}
        <AccordionItem value="labels">
          <AccordionTrigger>Nhãn sản phẩm</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Đang tải...</div>
              ) : filterOptions?.labels && filterOptions.labels.length > 0 ? (
                filterOptions.labels.map((label) => (
                  <div key={label.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`label-${label.id}`}
                      checked={filters.labelIds.includes(label.id)}
                      onCheckedChange={(checked) => handleArrayFilterChange("labelIds", label.id, checked as boolean)}
                    />
                    <Label htmlFor={`label-${label.id}`} className="text-sm flex-1 cursor-pointer">
                      {label.name}
                    </Label>
                    {label.count !== undefined && (
                      <span className="text-xs text-muted-foreground">({label.count})</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">Không có dữ liệu</div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Other filters */}
        <AccordionItem value="other">
          <AccordionTrigger>Bộ lọc khác</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {/* On sale filter */}
              <div className="flex items-center space-x-2">
                <Checkbox id="on-sale" checked={filters.onSale === true} onCheckedChange={handleOnSaleChange} />
                <Label htmlFor="on-sale" className="text-sm cursor-pointer">
                  Đang giảm giá
                </Label>
              </div>

              {/* In stock filter */}
              <div className="flex items-center space-x-2">
                <Checkbox id="in-stock" checked={filters.inStock === true} onCheckedChange={handleInStockChange} />
                <Label htmlFor="in-stock" className="text-sm cursor-pointer">
                  Còn hàng
                </Label>
              </div>

              {/* Origin country filter */}
              <div className="space-y-2">
                <Label htmlFor="origin-country" className="text-sm">
                  Xuất xứ
                </Label>
                <Input
                  id="origin-country"
                  placeholder="Nhập quốc gia xuất xứ"
                  value={filters.originCountry || ""}
                  onChange={handleOriginCountryChange}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Active filters */}
      {activeFilterCount > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Bộ lọc đang áp dụng:</h3>
          <div className="flex flex-wrap gap-2">
            {filters.brandIds.length > 0 &&
              filterOptions?.brands &&
              filterOptions.brands
                .filter((brand) => filters.brandIds.includes(brand.id))
                .map((brand) => (
                  <Badge key={`active-brand-${brand.id}`} variant="secondary" className="flex items-center gap-1">
                    {brand.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleArrayFilterChange("brandIds", brand.id, false)}
                    />
                  </Badge>
                ))}

            {filters.categoryIds.length > 0 &&
              filterOptions?.categories &&
              filterOptions.categories
                .filter((category) => filters.categoryIds.includes(category.id))
                .map((category) => (
                  <Badge key={`active-category-${category.id}`} variant="secondary" className="flex items-center gap-1">
                    {category.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleArrayFilterChange("categoryIds", category.id, false)}
                    />
                  </Badge>
                ))}

            {filters.genderIds.length > 0 &&
              filterOptions?.genders &&
              filterOptions.genders
                .filter((gender) => filters.genderIds.includes(gender.id))
                .map((gender) => (
                  <Badge key={`active-gender-${gender.id}`} variant="secondary" className="flex items-center gap-1">
                    {gender.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleArrayFilterChange("genderIds", gender.id, false)}
                    />
                  </Badge>
                ))}

            {/* Add more active filters as needed */}
          </div>
        </div>
      )}
    </div>
  )

  // Mobile filter button
  const mobileFilterButton = (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <Filter className="h-4 w-4 mr-2" />
          Bộ lọc
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
        {filterContent}
      </SheetContent>
    </Sheet>
  )

  return (
    <>
      {/* Mobile filter button */}
      <div className="lg:hidden mb-4">{mobileFilterButton}</div>

      {/* Desktop filter sidebar */}
      <div className="hidden lg:block">{filterContent}</div>
    </>
  )
}
