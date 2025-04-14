"use client"

import { useState, useCallback } from "react" // Import useCallback
import { useOrders, type OrdersFilters, type OrdersPagination, type OrdersSort } from "../hooks/use-orders"
import { OrderTable } from "./order-table"
import { OrderFilters } from "./order-filters"
import { OrderDetailsDialog } from "./order-details-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast"

export function OrderManagement() {
  const toast = useSonnerToast()
  const [filters, setFilters] = useState<OrdersFilters>({})
  const [pagination, setPagination] = useState<OrdersPagination>({
    page: 1,
    pageSize: 10,
  })
  const [sort, setSort] = useState<OrdersSort>({
    column: "order_date",
    direction: "desc",
  })
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const { data, isLoading, isError, error } = useOrders(filters, pagination, sort)

  if (isError) {
    toast.error(`Error loading orders: ${error?.message || "Unknown error"}`)
  }

  const handleOpenDetails = (orderId: number) => {
    setSelectedOrderId(orderId)
    setIsDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handlePageSizeChange = (pageSize: number) => {
    setPagination({ page: 1, pageSize })
  }

  const handleSortChange = (column: string, direction: "asc" | "desc") => {
    setSort({ column, direction })
  }

  // Memoize the onFilterChange function
  const onFilterChange = useCallback((newFilters: OrdersFilters) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 })) // Reset to first page when filters change
  }, [])

  return (
    <div className="space-y-4">
      <OrderFilters onFilterChange={onFilterChange} />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <OrderTable
          orders={data?.data || []}
          totalCount={data?.count || 0}
          pagination={pagination}
          sort={sort}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSortChange={handleSortChange}
          onViewDetails={handleOpenDetails}
        />
      )}

      <OrderDetailsDialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen} orderId={selectedOrderId} />
    </div>
  )
}
