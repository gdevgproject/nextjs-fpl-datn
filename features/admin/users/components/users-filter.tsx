"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserFilter } from "../types";

interface UsersFilterProps {
  filter: UserFilter;
  onFilterChange: (filter: Partial<UserFilter>) => void;
}

export function UsersFilter({ filter, onFilterChange }: UsersFilterProps) {
  const [searchValue, setSearchValue] = useState(filter.search || "");

  // Update the search input value when the filter changes externally
  useEffect(() => {
    setSearchValue(filter.search || "");
  }, [filter.search]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search: searchValue });
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchValue("");
    onFilterChange({ search: "" });
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search form */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 flex items-center relative"
        >
          <Input
            placeholder="Tìm kiếm theo email, tên, số điện thoại..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pr-10"
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

        {/* Role filter */}
        <div className="w-full sm:w-48">
          <Select
            value={filter.role}
            onValueChange={(value: any) => onFilterChange({ role: value })}
          >
            <SelectTrigger>
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
        </div>

        {/* Status filter */}
        <div className="w-full sm:w-48">
          <Select
            value={filter.status}
            onValueChange={(value: any) => onFilterChange({ status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="blocked">Bị chặn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}