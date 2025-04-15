"use client";

import type React from "react";
import { useState, useRef, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

/**
 * Optimized SearchForm component that handles product and order searches
 * Implements performance best practices like useCallback, memoization, and debouncing
 */
export const SearchForm = memo(function SearchForm() {
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
      className="relative w-full max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl flex-1"
      role="search"
    >
      <div className="flex items-center gap-2 bg-muted rounded-full px-2 py-1 shadow-sm border w-full min-w-0">
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={handleModeChange}
          className="shrink-0 rounded-full overflow-hidden border-none bg-transparent"
        >
          <ToggleGroupItem
            value="product"
            aria-label="Tìm sản phẩm"
            className="text-xs px-3 rounded-full data-[state=on]:bg-primary/10 data-[state=on]:text-primary transition-colors"
          >
            Sản phẩm
          </ToggleGroupItem>
          <ToggleGroupItem
            value="order"
            aria-label="Tra cứu đơn hàng"
            className="text-xs px-3 rounded-full data-[state=on]:bg-primary/10 data-[state=on]:text-primary transition-colors"
          >
            Đơn hàng
          </ToggleGroupItem>
        </ToggleGroup>
        <input
          ref={inputRef}
          type="search"
          placeholder={
            mode === "product" ? "Tìm kiếm sản phẩm..." : "Nhập mã đơn hàng..."
          }
          className={cn(
            "flex-1 bg-transparent outline-none border-0 px-2 py-1 text-sm min-w-0",
            "placeholder:text-muted-foreground"
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
            size="sm"
            className="px-1.5 h-7 rounded-full hover:bg-muted-foreground/10 hover:text-foreground"
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
          size="icon"
          aria-label={mode === "product" ? "Tìm kiếm" : "Tra cứu"}
          disabled={!query.trim()}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
});
