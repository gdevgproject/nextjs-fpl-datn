"use client"

import type { FilterOptions } from "../types/plp-types"
import FilterSidebar from "./filter-sidebar"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { X } from "lucide-react"

interface MobileFilterDrawerProps {
  open: boolean
  onClose: () => void
  filterOptions?: FilterOptions
  isLoading: boolean
}

export default function MobileFilterDrawer({ open, onClose, filterOptions, isLoading }: MobileFilterDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="h-[85vh]">
        <DrawerHeader className="flex items-center justify-between">
          <DrawerTitle>Bộ lọc</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
              <span className="sr-only">Đóng</span>
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto flex-1 pb-20">
          <FilterSidebar filterOptions={filterOptions} isLoading={isLoading} />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button>Áp dụng</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
