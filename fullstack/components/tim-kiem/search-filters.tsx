"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Star } from "lucide-react"

interface SearchFiltersProps {
  query: string
  selectedCategory?: string
  selectedBrand?: string
  selectedGender?: string
  selectedPriceMin?: string
  selectedPriceMax?: string
  selectedRating?: string
  onClose?: () => void
}

// Dữ liệu mẫu
const categories = [
  { id: "nuoc-hoa-nam", name: "Nước hoa Nam" },
  { id: "nuoc-hoa-nu", name: "Nước hoa Nữ" },
  { id: "nuoc-hoa-unisex", name: "Nước hoa Unisex" },
  { id: "nuoc-hoa-mini", name: "Nước hoa Mini" },
  { id: "nuoc-hoa-niche", name: "Nước hoa Niche" },
  { id: "nuoc-hoa-giftset", name: "Giftset" },
]

const brands = [
  { id: "dior", name: "Dior" },
  { id: "chanel", name: "Chanel" },
  { id: "gucci", name: "Gucci" },
  { id: "tom-ford", name: "Tom Ford" },
  { id: "versace", name: "Versace" },
  { id: "burberry", name: "Burberry" },
  { id: "calvin-klein", name: "Calvin Klein" },
  { id: "yves-saint-laurent", name: "Yves Saint Laurent" },
]

const genders = [
  { id: "nam", name: "Nam" },
  { id: "nu", name: "Nữ" },
  { id: "unisex", name: "Unisex" },
]

export function SearchFilters({
  query,
  selectedCategory,
  selectedBrand,
  selectedGender,
  selectedPriceMin,
  selectedPriceMax,
  selectedRating,
  onClose,
}: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [priceRange, setPriceRange] = useState<[number, number]>([
    selectedPriceMin ? Number.parseInt(selectedPriceMin) : 0,
    selectedPriceMax ? Number.parseInt(selectedPriceMax) : 10000000,
  ])

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleFilterChange = (filterType: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(filterType, value)

    // Reset page when filter changes
    params.set("page", "1")

    router.push(`/tim-kiem?${params.toString()}`)

    if (onClose) {
      onClose()
    }
  }

  const handlePriceChange = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("price_min", priceRange[0].toString())
    params.set("price_max", priceRange[1].toString())

    // Reset page when filter changes
    params.set("page", "1")

    router.push(`/tim-kiem?${params.toString()}`)

    if (onClose) {
      onClose()
    }
  }

  const handleRatingChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("rating", value)

    // Reset page when filter changes
    params.set("page", "1")

    router.push(`/tim-kiem?${params.toString()}`)

    if (onClose) {
      onClose()
    }
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams()
    params.set("q", query)

    router.push(`/tim-kiem?${params.toString()}`)

    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">Bộ lọc</h3>
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          Xóa tất cả
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["category", "brand", "gender", "price", "rating"]} className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger>Danh mục</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategory === category.id}
                    onCheckedChange={() => handleFilterChange("category", category.id)}
                  />
                  <Label htmlFor={`category-${category.id}`} className="text-sm font-normal cursor-pointer">
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brand">
          <AccordionTrigger>Thương hiệu</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={selectedBrand === brand.id}
                    onCheckedChange={() => handleFilterChange("brand", brand.id)}
                  />
                  <Label htmlFor={`brand-${brand.id}`} className="text-sm font-normal cursor-pointer">
                    {brand.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="gender">
          <AccordionTrigger>Giới tính</AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={selectedGender} onValueChange={(value) => handleFilterChange("gender", value)}>
              {genders.map((gender) => (
                <div key={gender.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={gender.id} id={`gender-${gender.id}`} />
                  <Label htmlFor={`gender-${gender.id}`} className="text-sm font-normal cursor-pointer">
                    {gender.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Giá</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              <Slider
                defaultValue={priceRange}
                min={0}
                max={10000000}
                step={100000}
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                className="my-6"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm">{formatPrice(priceRange[0])}</span>
                <span className="text-sm">{formatPrice(priceRange[1])}</span>
              </div>
              <Button size="sm" className="w-full mt-2" onClick={handlePriceChange}>
                Áp dụng
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating">
          <AccordionTrigger>Đánh giá</AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={selectedRating} onValueChange={handleRatingChange}>
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                  <Label htmlFor={`rating-${rating}`} className="text-sm font-normal cursor-pointer flex items-center">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                    ))}
                    {Array.from({ length: 5 - rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-muted-foreground" />
                    ))}
                    <span className="ml-1">trở lên</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {onClose && (
        <div className="pt-4 border-t">
          <Button className="w-full" onClick={onClose}>
            Xem kết quả
          </Button>
        </div>
      )}
    </div>
  )
}

