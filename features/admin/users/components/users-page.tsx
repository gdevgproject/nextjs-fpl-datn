"use client";

import { useUsers } from "../hooks/use-users";
import { UsersFilter } from "./users-filter";
import { UsersTable } from "./users-table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CirclePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UsersPage() {
  const {
    users,
    total,
    filteredTotal,
    isLoading,
    isError,
    error,
    filter,
    updateFilter,
    refetch,
  } = useUsers();

  return (
    <div className="container px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý người dùng</h1>
          <p className="text-muted-foreground">
            Quản lý và giám sát người dùng trong hệ thống
          </p>
        </div>
      </div>
      
      {/* Main content */}
      <div className="space-y-6">
        {/* Filters */}
        <UsersFilter filter={filter} onFilterChange={updateFilter} />

        {/* Status indicator */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang tải dữ liệu...</span>
            </div>
          </div>
        ) : isError ? (
          <div className="bg-destructive/15 text-destructive p-4 rounded-md">
            <p>Đã xảy ra lỗi: {error?.message}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()} 
              className="mt-2"
            >
              Thử lại
            </Button>
          </div>
        ) : (
          <TooltipProvider>
            <UsersTable
              users={users}
              filter={filter}
              onFilterChange={updateFilter}
              totalCount={filteredTotal}
            />
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
