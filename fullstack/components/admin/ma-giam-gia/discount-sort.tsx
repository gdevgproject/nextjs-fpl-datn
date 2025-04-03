"use client"

import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

export function DiscountSort() {
  const [sortOrder, setSortOrder] = useState("newest")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Sắp xếp
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Sắp xếp theo</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={sortOrder} onValueChange={setSortOrder}>
          <DropdownMenuRadioItem value="newest">Mới nhất</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="oldest">Cũ nhất</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="expiring-soon">Sắp hết hạn</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="highest-discount">Giảm giá cao nhất</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="most-used">Sử dụng nhiều nhất</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

