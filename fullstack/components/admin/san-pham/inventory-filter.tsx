git "use client"

import { useState } from "react"
import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { useMediaQuery } from "@/hooks/use-media-query"

interface InventoryFilterProps {
  onClose?: () => void
}

export function InventoryFilter({ onClose }: InventoryFilterProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 10000000])
  const isMobile = useMediaQuery("(max-width: 1024px)")

  // Các danh mục mẫu
  const categories = [
    { id: "1", name: "Nước hoa nam" },
    { id: "2", name: "Nước hoa nữ" },
    { id: "3", name: "Nước hoa unisex" },
    { id: "4", name: "Nước hoa mini" },
    { id: "5", name: "Gift set" },
  ]

  // Các thương hiệu mẫu
  const brands = [
    { id: "1", name: "Chanel" },
    { id: "2", name: "Dior" },
    { id: "3", name: "Gucci" },
    { id: "4", name: "Versace" },
    { id: "5", name: "Calvin Klein" },
    { id: "6", name: "Tom Ford" },
    { id: "7", name: "Burberry" },
    { id: "8", name: "Hermès" },
  ]

  // Các dung tích mẫu
  const volumes = [
    { id: "1", name: "10ml" },
    { id: "2", name: "30ml" },
    { id: "3", name: "50ml" },
    { id: "4", name: "100ml" },
    { id: "5", name: "200ml" },
  ]

  // Các trạng thái sản phẩm
  const statuses = [
    { id: "in_stock", name: "Còn hàng" },
    { id: "low_stock", name: "Sắp hết hàng" },
    { id: "out_of_stock", name: "Hết hàng" },
  ]

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) => (prev.includes(filterId) ? prev.filter((id) => id !== filterId) : [...prev, filterId]))
  }

  const clearAllFilters = () => {
    setActiveFilters([])
    setPriceRange([0, 10000000])
  }

  const getActiveFilterCount = () => {
    return activeFilters.length + (priceRange[0] > 0 || priceRange[1] < 10000000 ? 1 : 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
  }

  return (
    <>
      <CardHeader className="px-4 pt-4 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Bộ lọc</CardTitle>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {getActiveFilterCount() > 0 && (
          <div className="flex items-center justify-between mt-2">
            <Badge variant="secondary" className="rounded-sm">
              {getActiveFilterCount()} bộ lọc đang áp dụng
            </Badge>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={clearAllFilters}>
              Xóa tất cả
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4">
        <ScrollArea className="h-[calc(100vh-250px)] pr-4">
          <div className="space-y-4">
            <Accordion type="multiple" defaultValue={["category", "brand", "status", "volume", "price"]}>
              <AccordionItem value="category" className="border-b">
                <AccordionTrigger className="py-3 text-sm hover:no-underline">
                  <span className="font-medium">Danh mục</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-1">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={activeFilters.includes(`category-${category.id}`)}
                          onCheckedChange={() => toggleFilter(`category-${category.id}`)}
                        />
                        <Label htmlFor={`category-${category.id}`} className="text-sm font-normal cursor-pointer">
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="brand" className="border-b">
                <AccordionTrigger className="py-3 text-sm hover:no-underline">
                  <span className="font-medium">Thương hiệu</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="relative mb-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm thương hiệu..."
                      className="pl-8 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 pt-1 max-h-40 overflow-auto">
                    {brands
                      .filter((brand) => brand.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((brand) => (
                        <div key={brand.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`brand-${brand.id}`}
                            checked={activeFilters.includes(`brand-${brand.id}`)}
                            onCheckedChange={() => toggleFilter(`brand-${brand.id}`)}
                          />
                          <Label htmlFor={`brand-${brand.id}`} className="text-sm font-normal cursor-pointer">
                            {brand.name}
                          </Label>
                        </div>
                      ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="volume" className="border-b">
                <AccordionTrigger className="py-3 text-sm hover:no-underline">
                  <span className="font-medium">Dung tích</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-1">
                    {volumes.map((volume) => (
                      <div key={volume.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`volume-${volume.id}`}
                          checked={activeFilters.includes(`volume-${volume.id}`)}
                          onCheckedChange={() => toggleFilter(`volume-${volume.id}`)}
                        />
                        <Label htmlFor={`volume-${volume.id}`} className="text-sm font-normal cursor-pointer">
                          {volume.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="price" className="border-b">
                <AccordionTrigger className="py-3 text-sm hover:no-underline">
                  <span className="font-medium">Giá bán</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-1">
                    <div className="flex justify-between text-sm">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                    <Slider
                      defaultValue={priceRange}
                      min={0}
                      max={10000000}
                      step={100000}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="my-4"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="status" className="border-b">
                <AccordionTrigger className="py-3 text-sm hover:no-underline">
                  <span className="font-medium">Trạng thái</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-1">
                    {statuses.map((status) => (
                      <div key={status.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status.id}`}
                          checked={activeFilters.includes(`status-${status.id}`)}
                          onCheckedChange={() => toggleFilter(`status-${status.id}`)}
                        />
                        <Label htmlFor={`status-${status.id}`} className="text-sm font-normal cursor-pointer">
                          {status.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="flex justify-between p-4 pt-0">
        <Button variant="outline" className="w-full" onClick={clearAllFilters}>
          Xóa bộ lọc
        </Button>
        <Button className="w-full ml-2">Áp dụng</Button>
      </CardFooter>
    </>
  )
}

