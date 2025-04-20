"use client";

import { useState, useCallback, useMemo } from "react";
import {
  useAdminActivityLogs,
  useActivityTypes,
  useEntityTypes,
} from "../hooks/use-admin-activity-logs";
import type { AdminActivityLogsFilters, AdminActivityLog } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "./pagination";
import { LogsTable } from "./logs-table";
import { DateRangePicker } from "./date-range-picker";
import { Search, X, SlidersHorizontal, FilterX, History } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LogDetailsDialog } from "./log-details-dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Định nghĩa các tab loại hoạt động phổ biến - được cập nhật thông minh hơn
const DEFAULT_ACTIVITY_TABS = [
  { id: "all", label: "Tất cả", icon: <History className="h-3 w-3 mr-1" /> },
  { id: "INSERT", label: "Tạo mới", color: "bg-green-500" },
  { id: "UPDATE", label: "Cập nhật", color: "bg-blue-500" },
  { id: "DELETE", label: "Xóa", color: "bg-red-500" },
];

export function AdminActivityLogs() {
  // Toast notifications
  const toast = useSonnerToast();

  // State for filters
  const [filters, setFilters] = useState<AdminActivityLogsFilters>({});

  // State for pagination with default values
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });

  // State for sorting with default values
  const [sort, setSort] = useState({
    column: "timestamp",
    direction: "desc" as "asc" | "desc",
  });

  // State for selected log details
  const [selectedLog, setSelectedLog] = useState<AdminActivityLog | null>(null);
  
  // State for selected log index in current page
  const [selectedLogIndex, setSelectedLogIndex] = useState<number>(-1);

  // State for active tab
  const [activeTab, setActiveTab] = useState("all");

  // Fetch logs data - optimized hook
  const { data, isLoading, isError } = useAdminActivityLogs(
    filters,
    pagination,
    sort
  );

  // Fetch activity types and entity types - separate hooks with longer caching
  const { data: activityTypesData } = useActivityTypes();
  const { data: entityTypesData } = useEntityTypes();

  // Memoize activity types and entity types to avoid recalculations
  const activityTypes = useMemo(() => activityTypesData || [], [activityTypesData]);
  const entityTypes = useMemo(() => entityTypesData || [], [entityTypesData]);
  
  // Tạo danh sách các tab hoạt động dựa trên dữ liệu thực tế
  const activityTypeTabs = useMemo(() => {
    // Luôn giữ tab "Tất cả" đầu tiên
    const tabs = [...DEFAULT_ACTIVITY_TABS];
    
    // Nếu có dữ liệu từ API, thêm các loại hoạt động phổ biến
    if (activityTypes.length > 0) {
      // Lọc ra các loại hoạt động phổ biến (xuất hiện nhiều nhất) và chưa có trong default tabs
      const defaultTypeSet = new Set(DEFAULT_ACTIVITY_TABS.map(tab => tab.id));
      const popularTypes = activityTypes
        .filter(type => !defaultTypeSet.has(type))
        .slice(0, 5); // Chỉ lấy 5 loại phổ biến
      
      // Thêm vào danh sách tabs
      popularTypes.forEach(type => {
        let color = "bg-gray-500";
        if (type.includes("INSERT") || type.includes("CREATE")) color = "bg-green-500";
        if (type.includes("UPDATE")) color = "bg-blue-500";
        if (type.includes("DELETE")) color = "bg-red-500";
        if (type.includes("CANCEL")) color = "bg-orange-500";
        if (type.includes("APPROVE")) color = "bg-emerald-500";
        
        tabs.push({ id: type, label: formatActivityType(type), color });
      });
    }
    
    return tabs;
  }, [activityTypes]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (key: keyof AdminActivityLogsFilters, value: string | undefined) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value === "all" ? undefined : value,
      }));

      // Reset to the first page when filters change
      setPagination((prev) => ({
        ...prev,
        page: 1,
      }));
    },
    []
  );

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }));
  }, []);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setFilters({});
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
    setActiveTab("all");
  }, []);

  // Handle view log details
  const handleViewDetails = useCallback((log: AdminActivityLog, index: number) => {
    setSelectedLog(log);
    setSelectedLogIndex(index);
  }, []);

  // Handle close log details
  const handleCloseDetails = useCallback(() => {
    setSelectedLog(null);
    setSelectedLogIndex(-1);
  }, []);

  // Handle navigate between logs
  const handleNavigateLog = useCallback((index: number) => {
    if (data?.data && index >= 0 && index < data.data.length) {
      setSelectedLog(data.data[index]);
      setSelectedLogIndex(index);
    }
  }, [data?.data]);

  // Handle tab change
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);

    // Update filters based on selected tab
    setFilters((prev) => ({
      ...prev,
      activityType: value === "all" ? undefined : value,
    }));

    // Reset to first page
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  // Handle search with enter key
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const value = (e.target as HTMLInputElement).value;
        handleFilterChange("search", value || undefined);
      }
    },
    [handleFilterChange]
  );

  // Check if any filter is active for "Clear filters" button
  const hasActiveFilters = useMemo(
    () => Object.values(filters).some(Boolean),
    [filters]
  );

  return (
    <div className="space-y-4">
      {/* Tabs for common activity types */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="overflow-x-auto">
            <TabsList>
              {activityTypeTabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1">
                  {tab.icon ? (
                    tab.icon
                  ) : (
                    <span className={`inline-block w-2 h-2 rounded-full ${tab.color} mr-1`}></span>
                  )}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-[250px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mô tả/ID..."
                className="pl-8"
                value={filters.search || ""}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                onKeyDown={handleSearchKeyDown}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="sr-only">Bộ lọc</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[250px]">
                <DropdownMenuLabel>Bộ lọc nâng cao</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <div className="w-full cursor-default py-2">
                      <div className="mb-2 text-xs text-muted-foreground">Loại đối tượng:</div>
                      <Select
                        value={filters.entityType || ""}
                        onValueChange={(value) =>
                          handleFilterChange(
                            "entityType",
                            value === "all" ? undefined : value
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn loại đối tượng" />
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
                  
                  <DropdownMenuSeparator />
                  
                  {activityTypes.length > DEFAULT_ACTIVITY_TABS.length && (
                    <DropdownMenuItem asChild>
                      <div className="w-full cursor-default py-2">
                        <div className="mb-2 text-xs text-muted-foreground">Loại hoạt động:</div>
                        <Select
                          value={filters.activityType || ""}
                          onValueChange={(value) => {
                            handleFilterChange(
                              "activityType",
                              value === "all" ? undefined : value
                            );
                            setActiveTab(value === "all" ? "all" : value);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn loại hoạt động" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            <SelectItem value="all">Tất cả hoạt động</SelectItem>
                            {activityTypes.sort().map((type) => (
                              <SelectItem key={type} value={type}>
                                {formatActivityType(type)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <div className="w-full cursor-default py-2">
                      <div className="mb-2 text-xs text-muted-foreground">Khoảng thời gian:</div>
                      <DateRangePicker
                        startDate={filters.startDate}
                        endDate={filters.endDate}
                        onStartDateChange={(date) =>
                          handleFilterChange("startDate", date)
                        }
                        onEndDateChange={(date) =>
                          handleFilterChange("endDate", date)
                        }
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
                    disabled={!hasActiveFilters}
                  >
                    <FilterX className="h-4 w-4 mr-2" />
                    Xóa tất cả bộ lọc
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Hiển thị các bộ lọc đang áp dụng */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">Bộ lọc đang áp dụng:</span>
            
            {filters.activityType && (
              <Badge variant="secondary" className="flex gap-1 items-center">
                <span className="text-xs">Hoạt động: {formatActivityType(filters.activityType)}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0 ml-1" 
                  onClick={() => handleFilterChange("activityType", undefined)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {filters.entityType && (
              <Badge variant="secondary" className="flex gap-1 items-center">
                <span className="text-xs">Đối tượng: {filters.entityType}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0 ml-1" 
                  onClick={() => handleFilterChange("entityType", undefined)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {filters.search && (
              <Badge variant="secondary" className="flex gap-1 items-center">
                <span className="text-xs">Tìm kiếm: "{filters.search}"</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0 ml-1" 
                  onClick={() => handleFilterChange("search", undefined)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {(filters.startDate || filters.endDate) && (
              <Badge variant="secondary" className="flex gap-1 items-center">
                <span className="text-xs">
                  Thời gian: {filters.startDate ? new Date(filters.startDate).toLocaleDateString('vi-VN') : '...'} 
                  {' → '} 
                  {filters.endDate ? new Date(filters.endDate).toLocaleDateString('vi-VN') : '...'}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0 ml-1" 
                  onClick={() => {
                    handleFilterChange("startDate", undefined);
                    handleFilterChange("endDate", undefined);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {hasActiveFilters && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 px-2" 
                      onClick={handleClearFilters}
                    >
                      <FilterX className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Xóa tất cả</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Xóa tất cả bộ lọc</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}

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
                  <p className="text-muted-foreground">
                    Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
                  </p>
                </div>
              ) : data?.data &&
                Array.isArray(data.data) &&
                data.data.length > 0 ? (
                <>
                  <LogsTable
                    logs={data.data}
                    onViewDetails={(log, index) => handleViewDetails(log, index)}
                  />

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
                  <p className="text-muted-foreground">
                    Không tìm thấy nhật ký hoạt động nào.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Log details dialog with improved navigation */}
      {selectedLog && (
        <LogDetailsDialog
          log={selectedLog}
          logs={data?.data || []}
          currentIndex={selectedLogIndex}
          open={!!selectedLog}
          onOpenChange={handleCloseDetails}
          onNavigate={handleNavigateLog}
        />
      )}
    </div>
  );
}

// Helper function để định dạng tên loại hoạt động ngắn gọn
function formatActivityType(type: string): string {
  // Loại bỏ tiền tố entity và chỉ hiển thị hành động
  const actionMap = {
    'INSERT': 'Tạo mới',
    'CREATE': 'Tạo mới',
    'UPDATE': 'Cập nhật',
    'DELETE': 'Xóa',
    'CANCEL': 'Hủy',
    'APPROVE': 'Duyệt',
    'REJECT': 'Từ chối',
  };
  
  // Tách các phần của type: ENTITY_ACTION
  const parts = type.split('_');
  
  // Nếu chỉ có một phần, trả về nguyên bản
  if (parts.length === 1) return type;
  
  // Tìm hành động trong actionMap
  for (const [action, label] of Object.entries(actionMap)) {
    if (parts.includes(action)) {
      // Lấy entity từ các phần còn lại
      const entity = parts.filter(p => p !== action).join(' ').toLowerCase();
      return `${label} ${entity}`;
    }
  }
  
  // Nếu không tìm thấy hành động, trả về nguyên bản
  return type;
}
