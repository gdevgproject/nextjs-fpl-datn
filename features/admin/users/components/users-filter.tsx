"use client";

import { useState, useEffect } from "react";
import { Search, X, Filter, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { UserFilter } from "../types";

interface UsersFilterProps {
  filter: UserFilter;
  onFilterChange: (filter: Partial<UserFilter>) => void;
}

export function UsersFilter({ filter, onFilterChange }: UsersFilterProps) {
  const [searchValue, setSearchValue] = useState(filter.search || "");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Update the search input value when the filter changes externally
  useEffect(() => {
    setSearchValue(filter.search || "");
  }, [filter.search]);

  // Count active filters for badge display
  useEffect(() => {
    let count = 0;
    if (filter.role !== "all") count++;
    if (filter.status !== "all") count++;
    if (showVerifiedOnly) count++;
    if (filter.search) count++;
    setActiveFiltersCount(count);
  }, [filter, showVerifiedOnly]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search: searchValue, page: 1 });
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchValue("");
    onFilterChange({ search: "", page: 1 });
  };

  // Handle role filter change
  const handleRoleChange = (value: string) => {
    onFilterChange({ role: value as any, page: 1 });
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    onFilterChange({ status: value as any, page: 1 });
  };

  // Handle verified status change
  const handleVerifiedChange = (checked: boolean) => {
    setShowVerifiedOnly(checked);
    // In a real app you would also update the filter
    // onFilterChange({ verified: checked, page: 1 });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchValue("");
    setShowVerifiedOnly(false);
    onFilterChange({
      search: "",
      role: "all",
      status: "all",
      page: 1,
    });
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Search form - takes most space */}
      <form
        onSubmit={handleSearchSubmit}
        className="w-full flex items-center relative"
      >
        <Input
          placeholder="Tìm kiếm theo email, tên, số điện thoại..."
          value={searchValue}
          onChange={handleSearchChange}
          className="pr-10 text-xs sm:text-sm w-full"
        />
        {searchValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-8 h-full"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Xóa tìm kiếm</span>
          </Button>
        )}
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-0 h-full"
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Tìm kiếm</span>
        </Button>
      </form>

      {/* Responsive layout for filters */}
      <div className="flex flex-row gap-2 flex-wrap">
        {/* Filters dropdown for mobile & tablet */}
        <div className="flex md:hidden w-full">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1 justify-between"
              >
                <div className="flex gap-2 items-center">
                  <Filter className="h-4 w-4" />
                  <span>Bộ lọc</span>
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="start">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Vai trò</h4>
                  <Select value={filter.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Tất cả vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả vai trò</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="shipper">Shipper</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Trạng thái</h4>
                  <Select
                    value={filter.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="blocked">Bị chặn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showVerifiedOnly}
                      onCheckedChange={handleVerifiedChange}
                      id="verified-mobile"
                    />
                    <Label htmlFor="verified-mobile">
                      Chỉ hiện người dùng đã xác thực email
                    </Label>
                  </div>
                </div>
                <Separator />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                >
                  Đặt lại bộ lọc
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Desktop filters with improved responsiveness */}
        <div className="hidden md:flex md:flex-wrap gap-2">
          <div className="flex flex-wrap gap-2">
            <Select value={filter.role} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-[130px] lg:w-[160px] h-9 text-sm">
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="shipper">Shipper</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filter.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[130px] lg:w-[160px] h-9 text-sm">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="blocked">Bị chặn</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Bộ lọc nâng cao</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">
                      Bộ lọc nâng cao
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Tùy chỉnh bộ lọc để tìm người dùng chính xác hơn
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={showVerifiedOnly}
                        onCheckedChange={handleVerifiedChange}
                        id="verified"
                      />
                      <Label htmlFor="verified">
                        Chỉ hiện người dùng đã xác thực email
                      </Label>
                    </div>
                    {/* Additional filters can be added here */}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                  >
                    Đặt lại tất cả bộ lọc
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 text-sm"
              >
                Đặt lại
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Active filters badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {filter.search && (
            <Badge variant="secondary" className="px-2 py-1 text-xs">
              Từ khóa: {filter.search}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => onFilterChange({ search: "", page: 1 })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Xóa bộ lọc từ khóa</span>
              </Button>
            </Badge>
          )}

          {filter.role !== "all" && (
            <Badge variant="secondary" className="px-2 py-1 text-xs">
              Vai trò: {filter.role}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => onFilterChange({ role: "all", page: 1 })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Xóa bộ lọc vai trò</span>
              </Button>
            </Badge>
          )}

          {filter.status !== "all" && (
            <Badge variant="secondary" className="px-2 py-1 text-xs">
              Trạng thái: {filter.status === "active" ? "Hoạt động" : "Bị chặn"}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => onFilterChange({ status: "all", page: 1 })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Xóa bộ lọc trạng thái</span>
              </Button>
            </Badge>
          )}

          {showVerifiedOnly && (
            <Badge variant="secondary" className="px-2 py-1 text-xs">
              Đã xác thực email
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => setShowVerifiedOnly(false)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Xóa bộ lọc xác thực</span>
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
