"use client"

import { ArrowDownAZ, ArrowUpAZ, ArrowDownUp } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function ProductSort() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <ArrowDownUp className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Sắp xếp theo</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <ArrowDownAZ className="mr-2 h-4 w-4" />
          Mới nhất
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ArrowUpAZ className="mr-2 h-4 w-4" />
          Cũ nhất
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <ArrowDownAZ className="mr-2 h-4 w-4" />
          Tên A-Z
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ArrowUpAZ className="mr-2 h-4 w-4" />
          Tên Z-A
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <ArrowDownAZ className="mr-2 h-4 w-4" />
          Giá thấp đến cao
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ArrowUpAZ className="mr-2 h-4 w-4" />
          Giá cao đến thấp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

