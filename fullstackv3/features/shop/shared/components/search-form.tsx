"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Search, Package, ChevronDown } from "lucide-react";
import { useState } from "react";

const searchSchema = z.object({
  query: z.string().min(1, "Vui lòng nhập từ khóa tìm kiếm"),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export function SearchForm() {
  const router = useRouter();
  const [searchMode, setSearchMode] = useState<"product" | "order">("product");
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: "" },
  });

  const onSubmit = (data: SearchFormValues) => {
    if (searchMode === "product") {
      router.push(`/san-pham?search=${encodeURIComponent(data.query)}`);
    } else {
      router.push(`/tra-cuu-don-hang?token=${encodeURIComponent(data.query)}`);
    }
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
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
              {" "}
              <Search className="mr-2 h-4 w-4" />
              Tìm sản phẩm
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchMode("order")}>
              {" "}
              <Package className="mr-2 h-4 w-4" />
              Tra cứu đơn hàng
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Controller
          name="query"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="search"
              placeholder={
                searchMode === "product"
                  ? "Tìm kiếm sản phẩm..."
                  : "Nhập mã đơn hàng..."
              }
              className={`w-full pl-[110px] pr-10 ${
                errors.query ? "border-destructive" : ""
              }`}
              aria-invalid={errors.query ? "true" : "false"}
            />
          )}
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
      {errors.query && (
        <p className="text-xs text-destructive mt-1">{errors.query.message}</p>
      )}
    </form>
  );
}
