"use client"

import { usePlpFilters } from "../hooks/use-plp-filters"
import type { FilterOptions } from "../types/plp-types"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { formatCurrency } from "@/shared/lib/utils"

interface FilterSidebarProps {
  filterOptions?: FilterOptions
  isLoading: boolean
}

export default function FilterSidebar({ filterOptions, isLoading }: FilterSidebarProps) {
  const { filters, toggleFilter, setRangeFilter, isFilterActive } = usePlpFilters()

  const handlePriceChange = (value: number[]) => {
    setRangeFilter("min_price", "max_price", value[0], value[1])
  }

  const handleVolumeChange = (value: number[]) => {
    setRangeFilter("min_volume", "max_volume", value[0], value[1])
  }

  const handleReleaseYearChange = (value: number[]) => {
    setRangeFilter("release_year_min", "release_year_max", value[0], value[1])
  }

  if (isLoading) {
    return <FilterSidebarSkeleton />
  }

  if (!filterOptions) {
    return null
  }

  const priceRange = filterOptions.price_range
  const currentMinPrice = filters.min_price ?? priceRange?.min ?? 0
  const currentMaxPrice = filters.max_price ?? priceRange?.max ?? 10000000

  const volumes = filterOptions.volumes?.map((v) => v.value).sort((a, b) => a - b) || []
  const minVolume = Math.min(...volumes)
  const maxVolume = Math.max(...volumes)
  const currentMinVolume = filters.min_volume ?? minVolume
  const currentMaxVolume = filters.max_volume ?? maxVolume

  const releaseYears = filterOptions.release_years?.map((y) => y.value).sort((a, b) => a - b) || []
  const minYear = Math.min(...releaseYears)
  const maxYear = Math.max(...releaseYears)
  const currentMinYear = filters.release_year_min ?? minYear
  const currentMaxYear = filters.release_year_max ?? maxYear

  return (
    <div className="space-y-6">
      <div className="font-medium text-lg">Bộ lọc</div>

      <Accordion type="multiple" defaultValue={["price", "brands", "categories", "genders", "status"]}>
        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger>Giá</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="flex justify-between">
                <span>{formatCurrency(currentMinPrice)}</span>
                <span>{formatCurrency(currentMaxPrice)}</span>
              </div>
              <Slider
                defaultValue={[currentMinPrice, currentMaxPrice]}
                min={priceRange?.min ?? 0}
                max={priceRange?.max ?? 10000000}
                step={50000}
                onValueCommit={handlePriceChange}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Status Filters */}
        <AccordionItem value="status">
          <AccordionTrigger>Trạng thái</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="on-sale">Đang giảm giá</Label>
                <Switch
                  id="on-sale"
                  checked={isFilterActive("on_sale", true)}
                  onCheckedChange={() => toggleFilter("on_sale", true)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="in-stock">Còn hàng</Label>
                <Switch
                  id="in-stock"
                  checked={isFilterActive("in_stock", true)}
                  onCheckedChange={() => toggleFilter("in_stock", true)}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brands */}
        {filterOptions.brands && filterOptions.brands.length > 0 && (
          <AccordionItem value="brands">
            <AccordionTrigger>Thương hiệu</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2 max-h-60 overflow-y-auto pr-2">
                {filterOptions.brands.map((brand) => (
                  <div key={brand.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand.id}`}
                      checked={isFilterActive("brand_ids", brand.id)}
                      onCheckedChange={() => toggleFilter("brand_ids", brand.id)}
                    />
                    <Label htmlFor={`brand-${brand.id}`} className="flex-1 cursor-pointer">
                      {brand.name}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Categories */}
        {filterOptions.categories && filterOptions.categories.length > 0 && (
          <AccordionItem value="categories">
            <AccordionTrigger>Danh mục</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2 max-h-60 overflow-y-auto pr-2">
                {filterOptions.categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={isFilterActive("category_ids", category.id)}
                      onCheckedChange={() => toggleFilter("category_ids", category.id)}
                    />
                    <Label htmlFor={`category-${category.id}`} className="flex-1 cursor-pointer">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Genders */}
        {filterOptions.genders && filterOptions.genders.length > 0 && (
          <AccordionItem value="genders">
            <AccordionTrigger>Giới tính</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {filterOptions.genders.map((gender) => (
                  <div key={gender.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`gender-${gender.id}`}
                      checked={isFilterActive("gender_ids", gender.id)}
                      onCheckedChange={() => toggleFilter("gender_ids", gender.id)}
                    />
                    <Label htmlFor={`gender-${gender.id}`} className="flex-1 cursor-pointer">
                      {gender.name}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Ingredients */}
        {filterOptions.ingredients && filterOptions.ingredients.length > 0 && (
          <AccordionItem value="ingredients">
            <AccordionTrigger>Thành phần</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2 max-h-60 overflow-y-auto pr-2">
                {filterOptions.ingredients.map((ingredient) => (
                  <div key={ingredient.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`ingredient-${ingredient.id}`}
                      checked={isFilterActive("ingredient_ids", ingredient.id)}
                      onCheckedChange={() => toggleFilter("ingredient_ids", ingredient.id)}
                    />
                    <Label htmlFor={`ingredient-${ingredient.id}`} className="flex-1 cursor-pointer">
                      {ingredient.name}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Volume Range */}
        {volumes && volumes.length > 0 && (
          <AccordionItem value="volume">
            <AccordionTrigger>Dung tích (ml)</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="flex justify-between">
                  <span>{currentMinVolume} ml</span>
                  <span>{currentMaxVolume} ml</span>
                </div>
                <Slider
                  defaultValue={[currentMinVolume, currentMaxVolume]}
                  min={minVolume}
                  max={maxVolume}
                  step={5}
                  onValueCommit={handleVolumeChange}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Origin Countries */}
        {filterOptions.origin_countries && filterOptions.origin_countries.length > 0 && (
          <AccordionItem value="origin">
            <AccordionTrigger>Xuất xứ</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2 max-h-60 overflow-y-auto pr-2">
                {filterOptions.origin_countries.map((country) => (
                  <div key={country.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`origin-${country.value}`}
                      checked={filters.origin_country === country.value}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          toggleFilter("origin_country", country.value)
                        } else if (filters.origin_country === country.value) {
                          toggleFilter("origin_country", undefined)
                        }
                      }}
                    />
                    <Label htmlFor={`origin-${country.value}`} className="flex-1 cursor-pointer">
                      {country.value}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Release Year Range */}
        {releaseYears && releaseYears.length > 0 && (
          <AccordionItem value="year">
            <AccordionTrigger>Năm phát hành</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="flex justify-between">
                  <span>{currentMinYear}</span>
                  <span>{currentMaxYear}</span>
                </div>
                <Slider
                  defaultValue={[currentMinYear, currentMaxYear]}
                  min={minYear}
                  max={maxYear}
                  step={1}
                  onValueCommit={handleReleaseYearChange}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Labels */}
        {filterOptions.labels && filterOptions.labels.length > 0 && (
          <AccordionItem value="labels">
            <AccordionTrigger>Nhãn sản phẩm</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {filterOptions.labels.map((label) => (
                  <div key={label.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`label-${label.id}`}
                      checked={isFilterActive("label_ids", label.id)}
                      onCheckedChange={() => toggleFilter("label_ids", label.id)}
                    />
                    <Label htmlFor={`label-${label.id}`} className="flex-1 cursor-pointer">
                      {label.name}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  )
}

function FilterSidebarSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-24" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2 pl-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-5 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
