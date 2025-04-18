"use client"

import { useState } from "react"
import { InventoryTable } from "./inventory-table"
import { InventoryFilters } from "./inventory-filters"
import { InventoryAdjustmentDialog } from "./inventory-adjustment-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useDebounce } from "../hooks/use-debounce"

export function InventoryManagement() {
  // State for filters
  const [search, setSearch] = useState("")
  const [variantId, setVariantId] = useState<number | undefined>(undefined)
  const [reason, setReason] = useState("")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [minChange, setMinChange] = useState<number | undefined>(undefined)
  const [maxChange, setMaxChange] = useState<number | undefined>(undefined)

  // State for pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // State for sorting
  const [sort, setSort] = useState<{ column: string; direction: "asc" | "desc" }>({
    column: "timestamp",
    direction: "desc",
  })

  // State for adjustment dialog
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false)

  // Debounce search input
  const debouncedSearch = useDebounce(search)

  // Prepare filters for the hook
  const filters = {
    search: debouncedSearch,
    variantId,
    reason,
    startDate: dateRange.from?.toISOString(),
    endDate: dateRange.to?.toISOString(),
    minChange,
    maxChange,
  }

  // Prepare pagination for the hook
  const pagination = {
    page,
    pageSize,
  }

  return (
    <div className="container mx-auto py-6 space-y-4">
      <h1 className="text-2xl font-bold">Quản lý kho hàng</h1>

      <div className="flex justify-between items-center">
        <InventoryFilters
          search={search}
          onSearchChange={setSearch}
          variantId={variantId}
          onVariantIdChange={setVariantId}
          reason={reason}
          onReasonChange={setReason}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          minChange={minChange}
          onMinChangeChange={setMinChange}
          maxChange={maxChange}
          onMaxChangeChange={setMaxChange}
        />

        <Button onClick={() => setIsAdjustmentDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Điều chỉnh kho
        </Button>
      </div>

      <InventoryTable
        filters={filters}
        pagination={pagination}
        sort={sort}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSortChange={setSort}
      />

      <InventoryAdjustmentDialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen} />
    </div>
  )
}
