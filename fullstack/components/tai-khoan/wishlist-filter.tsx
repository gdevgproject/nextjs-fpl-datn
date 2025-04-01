"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, X, SlidersHorizontal } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useWishlist } from "@/lib/hooks/use-wishlist"
import { Badge } from "@/components/ui/badge"

export function WishlistFilter() {
  const { filterItems, clearFilters } = useWishlist()
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("")
  const [brand, setBrand] = useState("")
  const [sortBy, setSortBy] = useState("")
  const [priceRange, setPriceRange] = useState([0, 10000000])
  const [inStockOnly, setInStockOnly] = useState(false)
  const [isFiltered, setIsFiltered] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Danh sách danh mục mẫu
  const categories = [
    { id: "1", name: "Nước hoa nam" },
    { id: "2", name: "Nước hoa nữ" },
    { id: "3", name: "Nước hoa unisex" },
    { id: "4", name: "Nước hoa mini" },
    { id: "5", name: "Gift set" },
  ]

  // Danh sách thương hiệu mẫu
  const brands = [
    { id: "1", name: "Dior" },
    { id: "2", name: "Chanel" },
    { id: "3", name: "Tom Ford" },
    { id: "4", name: "Gucci" },
    { id: "5", name: "Versace" },
    { id: "6", name: "Burberry" },
    { id: "7", name: "Calvin Klein" },
    { id: "8", name: "Dolce & Gabbana" },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

  const applyFilters = () => {
    // Cập nhật trạng thái lọc
    const newActiveFilters: string[] = []

    if (searchTerm) newActiveFilters.push(`Tìm kiếm: ${searchTerm}`)
    if (category) {
      const categoryName = categories.find((c) => c.id === category)?.name
      if (categoryName) newActiveFilters.push(`Danh mục: ${categoryName}`)
    }
    if (brand) {
      const brandName = brands.find((b) => b.id === brand)?.name
      if (brandName) newActiveFilters.push(`Thương hiệu: ${brandName}`)
    }
    if (sortBy) {
      const sortName = getSortName(sortBy)
      newActiveFilters.push(`Sắp xếp: ${sortName}`)
    }
    if (priceRange[0] > 0 || priceRange[1] < 10000000) {
      newActiveFilters.push(`Giá: ${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`)
    }
    if (inStockOnly) newActiveFilters.push("Chỉ sản phẩm còn hàng")

    setActiveFilters(newActiveFilters)
    setIsFiltered(newActiveFilters.length > 0)

    // Gọi hàm lọc từ context
    filterItems({
      searchTerm,
      category,
      brand,
      sortBy,
      priceRange,
      inStockOnly,
    })
  }

  const handleReset = () => {
    setSearchTerm("")
    setCategory("")
    setBrand("")
    setSortBy("")
    setPriceRange([0, 10000000])
    setInStockOnly(false)
    setIsFiltered(false)
    setActiveFilters([])
    clearFilters()
  }

  const removeFilter = (filter: string) => {
    if (filter.startsWith("Tìm kiếm:")) setSearchTerm("")
    else if (filter.startsWith("Danh mục:")) setCategory("")
    else if (filter.startsWith("Thương hiệu:")) setBrand("")
    else if (filter.startsWith("Sắp xếp:")) setSortBy("")
    else if (filter.startsWith("Giá:")) setPriceRange([0, 10000000])
    else if (filter === "Chỉ sản phẩm còn hàng") setInStockOnly(false)

    // Cập nhật lại danh sách bộ lọc đang hoạt động
    setActiveFilters(activeFilters.filter((f) => f !== filter))

    // Áp dụng lại bộ lọc
    setTimeout(() => {
      applyFilters()
    }, 0)
  }

  const getSortName = (sortValue: string) => {
    switch (sortValue) {
      case "date_desc":
        return "Mới nhất"
      case "date_asc":
        return "Cũ nhất"
      case "price_asc":
        return "Giá thấp đến cao"
      case "price_desc":
        return "Giá cao đến thấp"
      case "name_asc":
        return "Tên A-Z"
      case "name_desc":
        return "Tên Z-A"
      default:
        return ""
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
  }

  // Mobile Filter Sheet
  const MobileFilter = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Lọc
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[90vw] sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Lọc sản phẩm</SheetTitle>
          <SheetDescription>Tùy chỉnh bộ lọc để tìm sản phẩm yêu thích của bạn</SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="category">
              <AccordionTrigger>Danh mục</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả danh mục</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="brand">
              <AccordionTrigger>Thương hiệu</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <Select value={brand} onValueChange={setBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn thương hiệu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả thương hiệu</SelectItem>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="price">
              <AccordionTrigger>Khoảng giá</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                  <Slider
                    defaultValue={[0, 10000000]}
                    max={10000000}
                    step={100000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sort">
              <AccordionTrigger>Sắp xếp</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sắp xếp theo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Mặc định</SelectItem>
                      <SelectItem value="date_desc">Mới nhất</SelectItem>
                      <SelectItem value="date_asc">Cũ nhất</SelectItem>
                      <SelectItem value="price_asc">Giá thấp đến cao</SelectItem>
                      <SelectItem value="price_desc">Giá cao đến thấp</SelectItem>
                      <SelectItem value="name_asc">Tên A-Z</SelectItem>
                      <SelectItem value="name_desc">Tên Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex items-center space-x-2 pt-2">
            <Switch id="in-stock-mobile" checked={inStockOnly} onCheckedChange={setInStockOnly} />
            <Label htmlFor="in-stock-mobile">Chỉ hiển thị sản phẩm còn hàng</Label>
          </div>
        </div>

        <SheetFooter className="pt-4">
          <SheetClose asChild>
            <Button variant="outline" onClick={handleReset}>
              Đặt lại
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button onClick={applyFilters}>Áp dụng</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )

  // Desktop Filter
  const DesktopFilter = () => (
    <form onSubmit={handleSearch} className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm sản phẩm yêu thích"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Thương hiệu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thương hiệu</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Mặc định</SelectItem>
              <SelectItem value="date_desc">Mới nhất</SelectItem>
              <SelectItem value="date_asc">Cũ nhất</SelectItem>
              <SelectItem value="price_asc">Giá thấp đến cao</SelectItem>
              <SelectItem value="price_desc">Giá cao đến thấp</SelectItem>
              <SelectItem value="name_asc">Tên A-Z</SelectItem>
              <SelectItem value="name_desc">Tên Z-A</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit">Lọc</Button>

          {isFiltered && (
            <Button type="button" variant="outline" onClick={handleReset}>
              <X className="mr-2 h-4 w-4" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="in-stock"
          checked={inStockOnly}
          onCheckedChange={(checked) => {
            setInStockOnly(checked)
            setTimeout(() => applyFilters(), 0)
          }}
        />
        <Label htmlFor="in-stock">Chỉ hiển thị sản phẩm còn hàng</Label>
      </div>
    </form>
  )

  return (
    <div className="space-y-4">
      {isMobile ? (
        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm sản phẩm yêu thích"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters()
                }
              }}
            />
          </div>
          <MobileFilter />
        </div>
      ) : (
        <DesktopFilter />
      )}

      {/* Hiển thị các bộ lọc đang hoạt động */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge key={filter} variant="secondary" className="flex items-center gap-1">
              {filter}
              <button onClick={() => removeFilter(filter)} className="ml-1 rounded-full hover:bg-muted">
                <X className="h-3 w-3" />
                <span className="sr-only">Xóa bộ lọc {filter}</span>
              </button>
            </Badge>
          ))}

          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleReset}>
            Xóa tất cả
          </Button>
        </div>
      )}
    </div>
  )
}

