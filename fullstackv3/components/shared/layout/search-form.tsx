"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export const SearchForm = memo(function SearchForm() {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<"product" | "order">("product");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // Submit handler cho từng chế độ
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;
      if (mode === "product") {
        window.dispatchEvent(
          new CustomEvent("search", { detail: { query: query.trim() } })
        );
        router.push(`/san-pham?q=${encodeURIComponent(query.trim())}`);
      } else {
        // Tra cứu đơn hàng: chuyển hướng sang trang tra cứu đơn hàng
        router.push(
          `/tra-cuu-don-hang?code=${encodeURIComponent(query.trim())}`
        );
      }
      setQuery("");
    },
    [query, router, mode]
  );

  // Optimized search button click handler
  const handleSearchClick = useCallback(() => {
    setIsExpanded((prev) => !prev);
    // Focus on input when expanding
    if (!isExpanded) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isExpanded]);

  // Optimized clear button click handler
  const handleClearClick = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, []);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Close search form on Escape key
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }

      // Focus search input on Ctrl+K or Cmd+K (common search shortcut)
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsExpanded(true);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }
    },
    [isExpanded]
  );

  // Handle clicks outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded &&
        formRef.current &&
        !formRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    // Handle keyboard shortcuts
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, handleKeyDown]);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="relative w-full max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl flex-1"
      role="search"
    >
      <div
        className="flex items-center gap-2 bg-muted rounded-full px-2 py-1 shadow-sm border w-full min-w-0"
      >
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(val) =>
            setMode((val as "product" | "order") || "product")
          }
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
            size="icon"
            className="text-muted-foreground"
            onClick={() => setQuery("")}
            aria-label="Xóa tìm kiếm"
          >
            <X className="h-4 w-4" />
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
