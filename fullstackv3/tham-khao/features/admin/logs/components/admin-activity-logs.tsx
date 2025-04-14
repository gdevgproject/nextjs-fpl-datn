"use client"

import { useState } from "react"
import { useAdminActivityLogs, type AdminActivityLogsFilters } from "../hooks/use-admin-activity-logs"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "./pagination"
import { LogsTable } from "./logs-table"
import { DateRangePicker } from "./date-range-picker"
import { Search, X, SlidersHorizontal } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { LogDetailsDialog } from "./log-details-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AdminActivityLogs() {
  // State for filters
  const [filters, setFilters] = useState<AdminActivityLogsFilters>({})

  // State for pagination
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  })

  // State for sorting
  const [sort, setSort] = useState({
    column: "timestamp",
    direction: "desc" as "asc" | "desc",
  })

  // State for selected log details
  const [selectedLog, setSelectedLog] = useState<any | null>(null)

  // State for active tab
  const [activeTab, setActiveTab] = useState("all")

  // Fetch logs data
  const { data, isLoading, isError } = useAdminActivityLogs(filters, pagination, sort)

  // Handle filter changes
  const handleFilterChange = (key: keyof AdminActivityLogsFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }))
    setPagination((prev) => ({
      ...prev,
      page: 1, // Reset to first page when filter changes
    }))
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }))
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({})
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }))
    setActiveTab("all")
  }

  // Handle view log details
  const handleViewDetails = (log: any) => {
    setSelectedLog(log)
  }

  // Handle close log details
  const handleCloseDetails = () => {
    setSelectedLog(null)
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setFilters((prev) => ({ ...prev, activityType: value === "all" ? undefined : value }))
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }))
  }

  // Get unique activity types for filter
  const activityTypes = Array.from(
    new Set(data?.data && Array.isArray(data.data) ? data.data.map((log: any) => log.activity_type) : []),
  ).sort()

  // Get unique entity types for filter
  const entityTypes = Array.from(
    new Set(data?.data && Array.isArray(data.data) ? data.data.map((log: any) => log.entity_type) : []),
  ).sort()

  // Predefined activity type tabs
  const activityTypeTabs = [
    { id: "all", label: "Tất cả" },
    { id: "PRODUCT_INSERT", label: "Tạo mới" },
    { id: "PRODUCT_UPDATE", label: "Cập nhật" },
    { id: "PRODUCT_DELETE", label: "Xóa" },
  ]

  return (
    <div className="space-y-4">
      {/* Tabs for common activity types */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            {activityTypeTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative w-[250px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mô tả..."
                className="pl-8"
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="sr-only">Bộ lọc</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[220px]">
                <DropdownMenuLabel>Bộ lọc nâng cao</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <div className="w-full cursor-default">
                      <Select
                        value={filters.entityType || ""}
                        onValueChange={(value) => handleFilterChange("entityType", value === "all" ? undefined : value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Loại đối tượng" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả đối tượng</SelectItem>
                          {entityTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <div className="w-full cursor-default">
                      <DateRangePicker
                        startDate={filters.startDate}
                        endDate={filters.endDate}
                        onStartDateChange={(date) => handleFilterChange("startDate", date)}
                        onEndDateChange={(date) => handleFilterChange("endDate", date)}
                      />
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleClearFilters}
                    disabled={!Object.values(filters).some(Boolean)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Xóa bộ lọc
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <CardContent className="p-0">
              {/* Table */}
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <Skeleton className="h-12 flex-1" />
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.</p>
                </div>
              ) : data?.data && Array.isArray(data.data) && data.data.length > 0 ? (
                <>
                  <LogsTable logs={data.data} onViewDetails={handleViewDetails} />

                  <div className="p-4 border-t">
                    <Pagination
                      currentPage={pagination.page}
                      pageSize={pagination.pageSize}
                      totalItems={data.count || 0}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Không tìm thấy nhật ký hoạt động nào.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Log details dialog */}
      {selectedLog && <LogDetailsDialog log={selectedLog} open={!!selectedLog} onOpenChange={handleCloseDetails} />}
    </div>
  )
}
