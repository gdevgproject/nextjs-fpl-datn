"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { SlidersHorizontal, X } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function FilterSidebar() {
  const [priceRange, setPriceRange] = useState([500000, 5000000])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Dữ liệu mẫu
  const brands = [
    { id: 1, name: "Dior", slug: "dior", count: 12 },
    { id: 2, name: "Chanel", slug: "chanel", count: 10 },
    { id: 3, name: "Tom Ford", slug: "tom-ford", count: 8 },
    { id: 4, name: "Versace", slug: "versace", count: 7 },
    { id: 5, name: "Gucci", slug: "gucci", count: 6 },
  ]

  const concentrations = [
    { id: 1, name: "Eau de Parfum (EDP)", slug: "edp", count: 25 },
    { id: 2, name: "Eau de Toilette (EDT)", slug: "edt", count: 30 },
    { id: 3, name: "Parfum/Extrait", slug: "parfum", count: 5 },
    { id: 4, name: "Eau de Cologne (EDC)", slug: "edc", count: 10 },
  ]

  const scents = [
    { id: 1, name: "Gỗ", slug: "go" },
    { id: 2, name: "Hương biển", slug: "huong-bien" },
    { id: 3, name: "Cam quýt", slug: "cam-quyt" },
    { id: 4, name: "Phương Đông", slug: "phuong-dong" },
    { id: 5, name: "Gia vị", slug: "gia-vi" },
  ]

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }

  const clearFilters = () => {
    setActiveFilters([])
    setPriceRange([500000, 5000000])
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {activeFilters.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Bộ lọc đang chọn</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-muted-foreground text-xs"
              onClick={clearFilters}
            >
              Xóa tất cả
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Badge key={filter} variant="secondary" className="rounded-full flex items-center gap-1">
                {filter}
                <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => toggleFilter(filter)} />
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Accordion type="multiple" defaultValue={["brands", "price", "concentration"]}>
        <AccordionItem value="price">
          <AccordionTrigger>Giá</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                defaultValue={priceRange}
                max={10000000}
                min={0}
                step={50000}
                value={priceRange}
                onValueChange={setPriceRange}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm">{formatCurrency(priceRange[0])}</span>
                <span className="text-sm">{formatCurrency(priceRange[1])}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="brands">
          <AccordionTrigger>Thương hiệu</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={activeFilters.includes(brand.name)}
                    onCheckedChange={() => toggleFilter(brand.name)}
                  />
                  <label
                    htmlFor={`brand-${brand.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex justify-between w-full"
                  >
                    <span>{brand.name}</span>
                    <span className="text-muted-foreground">({brand.count})</span>
                  </label>
                </div>
              ))}
              <Button variant="link" size="sm" className="h-auto p-0" asChild>
                <Link href="/thuong-hieu">Xem tất cả thương hiệu</Link>
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="concentration">
          <AccordionTrigger>Nồng độ</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {concentrations.map((concentration) => (
                <div key={concentration.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`concentration-${concentration.id}`}
                    checked={activeFilters.includes(concentration.name)}
                    onCheckedChange={() => toggleFilter(concentration.name)}
                  />
                  <label
                    htmlFor={`concentration-${concentration.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex justify-between w-full"
                  >
                    <span>{concentration.name}</span>
                    <span className="text-muted-foreground">({concentration.count})</span>
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="scents">
          <AccordionTrigger>Mùi hương</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {scents.map((scent) => (
                <div key={scent.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`scent-${scent.id}`}
                    checked={activeFilters.includes(scent.name)}
                    onCheckedChange={() => toggleFilter(scent.name)}
                  />
                  <label
                    htmlFor={`scent-${scent.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {scent.name}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )

  return (
    <>
      {/* Mobile Filter */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetTrigger asChild className="md:hidden mb-4">
          <Button variant="outline" className="w-full flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Lọc sản phẩm
            {activeFilters.length > 0 && (
              <Badge className="ml-2 rounded-full h-5 w-5 p-0 flex items-center justify-center">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Bộ lọc</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Filter */}
      <div className="hidden md:block">
        <h2 className="text-lg font-semibold mb-4">Bộ lọc</h2>
        <FilterContent />
      </div>
    </>
  )
}

