"use client";

import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Loader2,
  Search,
  Sparkles,
  AlertTriangle,
  Clock,
  BadgeInfo,
} from "lucide-react";
import { type ProductSuggestion } from "../hooks/use-ai-search-suggestions";
import { cn } from "@/lib/utils";

interface SearchSuggestionsProps {
  query: string;
  suggestions: ProductSuggestion[];
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  isStale?: boolean;
  selectedItemIndex?: number | null;
  onSelectSuggestion: () => void;
  rateLimited?: boolean;
  usingFallbackModel?: boolean;
}

export function SearchSuggestions({
  query,
  suggestions,
  isLoading,
  error,
  isOpen,
  isStale = false,
  selectedItemIndex = null,
  onSelectSuggestion,
  rateLimited = false,
  usingFallbackModel = false,
}: SearchSuggestionsProps) {
  // Don't render if not open or if query is empty
  if (!isOpen || !query.trim()) {
    return null;
  }

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

  // Ensure we only have a valid selectedItemIndex
  const validSelectedIndex =
    selectedItemIndex !== null &&
    selectedItemIndex >= 0 &&
    selectedItemIndex < suggestions.length
      ? selectedItemIndex
      : null;

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[350px] overflow-hidden rounded-md border border-border bg-background shadow-lg animate-in fade-in-0 zoom-in-95">
      <div className="flex max-h-[350px] flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Đang tìm kiếm sản phẩm...
            </span>
          </div>
        ) : rateLimited ? (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-2 p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Đã đạt giới hạn tìm kiếm
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Hệ thống tạm thời quá tải. Vui lòng đợi vài giây và thử lại sau.
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-2 p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-sm font-medium text-destructive">
              Đã xảy ra lỗi
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              {error}
            </p>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="overflow-y-auto p-1">
            {/* AI summary moved to top */}
            <div className="px-2 py-1.5 text-xs text-muted-foreground border-b border-border/50">
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-primary flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI
                </span>
                <span>đề xuất {suggestions.length} sản phẩm phù hợp</span>
              </span>
            </div>
            {suggestions.map((suggestion, index) => (
              <Link
                key={suggestion.id}
                href={`/san-pham/${suggestion.slug}`}
                onClick={onSelectSuggestion}
                className={cn(
                  "flex items-center gap-3 rounded-sm p-2 transition-colors",
                  validSelectedIndex === index
                    ? "bg-muted"
                    : "hover:bg-muted/50",
                  validSelectedIndex === index
                    ? "outline outline-1 outline-primary/30"
                    : ""
                )}
              >
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-sm border">
                  <Image
                    src={suggestion.image_url || "/placeholder.jpg"}
                    alt={suggestion.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-medium">
                      {suggestion.name}
                      {suggestion.brand_name && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({suggestion.brand_name})
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-primary font-medium">
                    {suggestion.sale_price ? (
                      <Fragment>
                        <span>{formatPrice(suggestion.sale_price)}</span>
                        <span className="ml-1.5 line-through text-muted-foreground">
                          {formatPrice(suggestion.price)}
                        </span>
                      </Fragment>
                    ) : (
                      <span>{formatPrice(suggestion.price)}</span>
                    )}
                  </p>
                  {suggestion.relevance && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {suggestion.relevance}
                    </p>
                  )}
                </div>
              </Link>
            ))}
            {usingFallbackModel && (
              <div className="px-2 py-1 text-xs text-muted-foreground border-t border-border/50 flex items-center gap-1.5">
                <BadgeInfo className="h-3 w-3 text-blue-500" />
                <span>Đang sử dụng model dự phòng</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
            <Search className="h-5 w-5 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Không tìm thấy sản phẩm nào cho "{query}"
            </p>

            {usingFallbackModel && (
              <div className="mt-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full text-xs flex items-center gap-1.5">
                <BadgeInfo className="h-3 w-3 text-blue-500" />
                <span className="text-blue-600 dark:text-blue-400">
                  Đang sử dụng model dự phòng
                </span>
              </div>
            )}
          </div>
        )}

        {isStale && !rateLimited && (
          <div className="bg-muted/20 py-1 px-3 text-center">
            <span className="text-xs text-muted-foreground animate-pulse">
              Đang cập nhật kết quả...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
