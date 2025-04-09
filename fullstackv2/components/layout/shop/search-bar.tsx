"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function SearchBar() {
  const router = useRouter();
  const [searchMode, setSearchMode] = useState<"product" | "order">("product");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    if (searchMode === "product") {
      router.push(`/san-pham?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push(`/tra-cuu-don-hang?token=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative flex w-full items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute left-0 z-10 h-full px-3 text-muted-foreground hover:text-foreground border-r flex items-center gap-1"
            >
              {searchMode === "product" ? "Sản phẩm" : "Đơn hàng"}
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[160px]">
            <DropdownMenuItem onClick={() => setSearchMode("product")}>
              <Search className="mr-2 h-4 w-4" />
              Tìm sản phẩm
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchMode("order")}>
              <Package className="mr-2 h-4 w-4" />
              Tra cứu đơn hàng
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          type="search"
          placeholder={
            searchMode === "product"
              ? "Tìm kiếm sản phẩm..."
              : "Nhập mã đơn hàng..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-[110px] pr-10"
        />

        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="absolute right-0 h-full"
        >
          {searchMode === "product" ? (
            <Search className="h-4 w-4" />
          ) : (
            <Package className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  );
}
