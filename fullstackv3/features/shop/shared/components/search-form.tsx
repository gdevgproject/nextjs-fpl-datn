"use client";

import type React from "react";
import { useState, useRef, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Optimized SearchForm component that handles product and order searches
 * Implements performance best practices like useCallback, memoization, and debouncing
 */
export const SearchForm = memo(function SearchForm({
  mobile,
}: {
  mobile?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"product" | "order">("product");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // Submit handler with useCallback to prevent unnecessary recreations
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;

      if (mode === "product") {
        // Use custom event to notify other components about the search
        window.dispatchEvent(
          new CustomEvent("search", { detail: { query: query.trim() } })
        );
        router.push(`/san-pham?q=${encodeURIComponent(query.trim())}`);
      } else {
        // Order lookup
        router.push(
          `/tra-cuu-don-hang?code=${encodeURIComponent(query.trim())}`
        );
      }
      setQuery("");
    },
    [query, router, mode]
  );

  // Clear button with useCallback for optimization
  const handleClearClick = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, []);

  // Mode change handler with useCallback
  const handleModeChange = useCallback((value: string) => {
    setMode((value as "product" | "order") || "product");
    // Focus on input after mode change for better UX
    setTimeout(() => inputRef.current?.focus(), 10);
  }, []);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={cn(
        "relative w-full max-w-full flex-1",
        mobile ? "mt-2 mb-2" : ""
      )}
      role="search"
    >
      <div
        className={cn(
          "flex items-center gap-2 bg-background border border-border rounded-[10px] px-3 py-2 shadow-sm w-full min-w-0 focus-within:ring-2 focus-within:ring-primary/30 transition-all",
          mobile ? "h-12 text-base" : ""
        )}
      >
        {/* Mode dropdown replaces toggle group */}
        <Select value={mode} onValueChange={handleModeChange}>
          <SelectTrigger
            className={cn(
              "w-28 h-8 text-xs rounded-[8px] bg-background border-none shadow-none px-2",
              mobile ? "h-10 text-sm" : ""
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            align="start"
            className="min-w-[120px] rounded-[8px] border border-border"
          >
            <SelectItem value="product">Sản phẩm</SelectItem>
            <SelectItem value="order">Đơn hàng</SelectItem>
          </SelectContent>
        </Select>
        <input
          ref={inputRef}
          type="search"
          placeholder={
            mode === "product" ? "Tìm kiếm sản phẩm..." : "Nhập mã đơn hàng..."
          }
          className={cn(
            "flex-1 bg-transparent outline-none border-0 px-2 py-1 text-sm min-w-0",
            "placeholder:text-muted-foreground",
            mobile ? "text-base h-10" : ""
          )}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={
            mode === "product" ? "Tìm kiếm sản phẩm" : "Tra cứu đơn hàng"
          }
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size={mobile ? "default" : "sm"}
            className={cn(
              "px-1.5 h-7 rounded-[8px] hover:bg-muted-foreground/10 hover:text-foreground",
              mobile ? "h-10 w-10" : ""
            )}
            onClick={handleClearClick}
            aria-label="Xóa tìm kiếm"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Xóa tìm kiếm</span>
          </Button>
        )}
        <Button
          type="submit"
          variant="ghost"
          size={mobile ? "default" : "icon"}
          aria-label={mode === "product" ? "Tìm kiếm" : "Tra cứu"}
          disabled={!query.trim()}
          className={cn("rounded-[8px]", mobile ? "h-10 w-10" : "")}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
});
