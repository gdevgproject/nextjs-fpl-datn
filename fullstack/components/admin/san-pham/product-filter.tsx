"use client"

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
import { useMediaQuery } from "@/hooks/use-media-query"

interface ProductFilterProps {
  onClose?: () => void
}

export function ProductFilter({ onClose }: ProductFilterProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
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

  // Các giới tính mẫu
  const genders = [
    { id: "1", name: "Nam" },
    { id: "2", name: "Nữ" },
    { id: "3", name: "Unisex" },
  ]

  // Các loại nước hoa mẫu
  const perfumeTypes = [
    { id: "1", name: "Eau de Parfum" },
    { id: "2", name: "Eau de Toilette" },
    { id: "3", name: "Eau de Cologne" },
    { id: "4", name: "Parfum" },
  ]

  // Các nồng độ mẫu
  const concentrations = [
    { id: "1", name: "Nhẹ" },
    { id: "2", name: "Vừa" },
    { id: "3", name: "Mạnh" },
  ]

  // Các trạng thái sản phẩm
  const statuses = [
    { id: "active", name: "Còn hàng" },
    { id: "out_of_stock", name: "Hết hàng" },
    { id: "deleted", name: "Đã xóa" },
  ]

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) => (prev.includes(filterId) ? prev.filter((id) => id !== filterId) : [...prev, filterId]))
  }

  const clearAllFilters = () => {
    setActiveFilters([])
  }

  const getActiveFilterCount = () => {
    return activeFilters.length
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
            <Accordion type="multiple" defaultValue={["category", "brand", "status"]}>
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

              <AccordionItem value="gender" className="border-b">
                <AccordionTrigger className="py-3 text-sm hover:no-underline">
                  <span className="font-medium">Giới tính</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-1">
                    {genders.map((gender) => (
                      <div key={gender.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`gender-${gender.id}`}
                          checked={activeFilters.includes(`gender-${gender.id}`)}
                          onCheckedChange={() => toggleFilter(`gender-${gender.id}`)}
                        />
                        <Label htmlFor={`gender-${gender.id}`} className="text-sm font-normal cursor-pointer">
                          {gender.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="perfumeType" className="border-b">
                <AccordionTrigger className="py-3 text-sm hover:no-underline">
                  <span className="font-medium">Loại nước hoa</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-1">
                    {perfumeTypes.map((type) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type.id}`}
                          checked={activeFilters.includes(`type-${type.id}`)}
                          onCheckedChange={() => toggleFilter(`type-${type.id}`)}
                        />
                        <Label htmlFor={`type-${type.id}`} className="text-sm font-normal cursor-pointer">
                          {type.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="concentration" className="border-b">
                <AccordionTrigger className="py-3 text-sm hover:no-underline">
                  <span className="font-medium">Nồng độ</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-1">
                    {concentrations.map((concentration) => (
                      <div key={concentration.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`concentration-${concentration.id}`}
                          checked={activeFilters.includes(`concentration-${concentration.id}`)}
                          onCheckedChange={() => toggleFilter(`concentration-${concentration.id}`)}
                        />
                        <Label
                          htmlFor={`concentration-${concentration.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {concentration.name}
                        </Label>
                      </div>
                    ))}
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

