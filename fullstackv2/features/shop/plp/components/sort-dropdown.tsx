"use client"

import { SORT_OPTIONS, type SortOption, type SortOrder } from "../types/plp-types"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowDownAZ, ArrowUpAZ, ArrowDownWideNarrow, ArrowUpWideNarrow, SlidersHorizontal } from "lucide-react"

interface SortDropdownProps {
  sortBy: SortOption
  sortOrder: SortOrder
  onSortChange: (sortBy: SortOption, sortOrder: SortOrder) => void
}

export default function SortDropdown({ sortBy, sortOrder, onSortChange }: SortDropdownProps) {
  // Find the current sort option display
  const currentSort =
    SORT_OPTIONS.find((option) => option.value === sortBy && option.defaultOrder === sortOrder) || SORT_OPTIONS[0]

  // Get sort icon based on current sort
  const getSortIcon = () => {
    if (sortBy === "name") {
      return sortOrder === "asc" ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />
    } else if (sortBy === "display_price") {
      return sortOrder === "asc" ? (
        <ArrowDownWideNarrow className="h-4 w-4" />
      ) : (
        <ArrowUpWideNarrow className="h-4 w-4" />
      )
    }
    return <SlidersHorizontal className="h-4 w-4" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {getSortIcon()}
          <span className="hidden sm:inline">Sắp xếp:</span> {currentSort.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {SORT_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={`${option.value}-${option.defaultOrder}`}
            className={
              sortBy === option.value && sortOrder === option.defaultOrder ? "bg-accent text-accent-foreground" : ""
            }
            onClick={() => onSortChange(option.value, option.defaultOrder)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
