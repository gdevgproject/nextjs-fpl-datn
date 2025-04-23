"use client";

import { useState } from "react";
import { useUsers } from "../hooks/use-users";
import { UsersFilter } from "./users-filter";
import { UsersTable } from "./users-table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2, RefreshCw, UsersRound, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function UsersPage() {
  const {
    users,
    total,
    filteredTotal,
    isLoading,
    isFetching,
    isError,
    error,
    filter,
    updateFilter,
    refetch,
  } = useUsers();

  const [viewMode, setViewMode] = useState<"all" | "recent" | "blocked">("all");

  // Calculate user statistics
  const activeUsers = users?.filter((user) => !user.is_blocked).length || 0;
  const blockedUsers = users?.filter((user) => user.is_blocked).length || 0;
  const nonVerifiedUsers =
    users?.filter((user) => !user.email_confirmed_at).length || 0;

  // Handle view mode change
  const handleViewModeChange = (mode: "all" | "recent" | "blocked") => {
    setViewMode(mode);

    // Update the filter based on the view mode
    if (mode === "blocked") {
      updateFilter({ status: "blocked" });
    } else if (mode === "recent") {
      // Sort by newest users
      updateFilter({ status: "all" });
      // Note: In a real application, you might also want to sort by creation date
    } else {
      updateFilter({ status: "all" });
    }
  };

  return (
    <div className="container px-2 md:px-4 py-4 md:py-6 space-y-4 md:space-y-6 mx-auto max-w-7xl">
      {/* Header with stats cards */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Quản lý người dùng
            </h1>
            <p className="text-muted-foreground">
              Quản lý và giám sát người dùng trong hệ thống
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              className="text-xs md:text-sm"
            >
              <RefreshCw className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng người dùng
              </CardTitle>
              <UsersRound className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : total}
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredTotal !== total
                  ? `Đang hiển thị ${filteredTotal} người dùng theo bộ lọc`
                  : "Hiển thị tất cả người dùng"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Người dùng đang hoạt động
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {isLoading ? "..." : activeUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                {isLoading
                  ? ""
                  : `${Math.round(
                      (activeUsers / total) * 100
                    )}% tổng số người dùng`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Người dùng bị chặn
              </CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {isLoading ? "..." : blockedUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                {isLoading
                  ? ""
                  : `${Math.round(
                      (blockedUsers / total) * 100
                    )}% tổng số người dùng`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Chưa xác thực email
              </CardTitle>
              <Badge
                variant="outline"
                className="text-amber-500 border-amber-200"
              >
                Cảnh báo
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                {isLoading ? "..." : nonVerifiedUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                {nonVerifiedUsers > 0
                  ? "Cần kiểm tra để đảm bảo tài khoản hợp lệ"
                  : "Tất cả người dùng đã xác thực email"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-4">
        {/* Tab Views and Filters */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <Tabs
            defaultValue="all"
            value={viewMode}
            onValueChange={(value) => handleViewModeChange(value as any)}
            className="w-full md:w-auto"
          >
            <TabsList className="grid w-full md:w-auto grid-cols-3">
              <TabsTrigger value="all">Tất cả người dùng</TabsTrigger>
              <TabsTrigger value="recent">Người dùng mới</TabsTrigger>
              <TabsTrigger value="blocked">Đã bị chặn</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Advanced filters */}
          <UsersFilter filter={filter} onFilterChange={updateFilter} />
        </div>

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
              isFetching={isFetching}
            />
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
