"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { SlidersHorizontal } from "lucide-react"
import { FilterSidebar } from "@/components/san-pham/filter-sidebar"
import { useMediaQuery } from "@/hooks/use-media-query"

export function CategoryMobileFilters() {
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Số lượng bộ lọc đã áp dụng (giả định)
  const activeFiltersCount = 3

  if (isDesktop) return null

  return (
    <div className="md:hidden mb-6">
      {isDesktop ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Lọc sản phẩm
              {activeFiltersCount > 0 && (
                <Badge className="ml-auto rounded-full h-5 w-5 p-0 flex items-center justify-center">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85%] sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Bộ lọc</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <FilterSidebar />
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="w-full flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Lọc sản phẩm
              {activeFiltersCount > 0 && (
                <Badge className="ml-auto rounded-full h-5 w-5 p-0 flex items-center justify-center">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Bộ lọc</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-8">
              <FilterSidebar />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}

