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
  CircleX,
  Zap,
  Brain,
  ShoppingBag,
  ExternalLink,
  Star,
} from "lucide-react";
import { type ProductSuggestion } from "../hooks/use-ai-search-suggestions";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

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

  // Calculate discount percentage
  const calculateDiscountPercentage = (
    originalPrice: number,
    salePrice: number
  ): number => {
    if (!originalPrice || !salePrice || originalPrice <= salePrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  // Ensure we only have a valid selectedItemIndex
  const validSelectedIndex =
    selectedItemIndex !== null &&
    selectedItemIndex >= 0 &&
    selectedItemIndex < suggestions.length
      ? selectedItemIndex
      : null;

  // Simplified loading dots without useState/useEffect for static rendering compatibility
  const loadingDots = "...";

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[480px] overflow-hidden rounded-xl border border-border/40 bg-background/95 backdrop-blur-sm shadow-lg animate-in fade-in-0 zoom-in-98 transition-all">
      <div className="flex max-h-[480px] flex-col overflow-hidden">
        {/* AI Search Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-gradient-to-r from-primary/5 via-background to-primary/5">
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-3 w-3 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground/90">
              AI Search
            </span>
          </div>
          {isLoading && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">
                Đang tìm{loadingDots}
              </span>
              <div className="w-3 h-3 rounded-full bg-primary/80" />
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col space-y-3 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                AI đang phân tích kết quả
              </span>
            </div>

            {/* Loading skeleton */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-14 w-14 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}

            <div className="flex items-center justify-center gap-2 py-2 px-3 bg-primary/5 rounded-lg mt-1">
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                <Sparkles className="h-3 w-3 text-primary/70" />
                <Sparkles className="h-3 w-3 text-primary/40" />
              </div>
              <span className="text-xs text-muted-foreground">
                AI đang tìm kiếm những sản phẩm phù hợp nhất
              </span>
            </div>
          </div>
        ) : rateLimited ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-3 p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 ring-4 ring-amber-50 dark:ring-amber-900/10">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Đã đạt giới hạn tìm kiếm
            </p>
            <p className="text-xs text-muted-foreground mt-2 max-w-xs">
              Hệ thống AI tạm thời quá tải. Vui lòng đợi vài giây và thử lại
              sau.
            </p>
            <Badge
              variant="outline"
              className="mt-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
            >
              <Clock className="h-3 w-3 mr-1" />
              <span>Hãy thử lại sau</span>
            </Badge>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-3 p-3 rounded-full bg-destructive/10 ring-4 ring-destructive/5">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-sm font-medium text-destructive">
              Đã xảy ra lỗi
            </p>
            <p className="text-xs text-muted-foreground mt-2 max-w-xs">
              {error}
            </p>
            <Badge
              variant="outline"
              className="mt-3 bg-destructive/5 text-destructive border-destructive/20"
            >
              <CircleX className="h-3 w-3 mr-1" />
              <span>Không thể kết nối với AI</span>
            </Badge>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="overflow-y-auto scrollbar-thin">
            {/* AI summary with animated gradient background */}
            <div className="px-3 py-2.5 text-xs border-b border-border/30 bg-gradient-to-r from-primary/5 via-background/80 to-primary/10">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Badge
                    variant="default"
                    className="bg-primary/90 hover:bg-primary/90 text-[10px] py-0 px-1.5"
                  >
                    <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                    AI
                  </Badge>
                  <span className="text-muted-foreground">
                    đã tìm thấy{" "}
                    <span className="font-medium text-foreground">
                      {suggestions.length}
                    </span>{" "}
                    kết quả phù hợp
                  </span>
                </span>
                {isStale && (
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 px-1.5 bg-primary/5 text-primary border-primary/20 flex items-center gap-1"
                  >
                    <Loader2 className="h-2 w-2 animate-spin" />
                    <span>Đang cập nhật</span>
                  </Badge>
                )}
              </div>
            </div>

            {/* Product suggestions */}
            <div className="p-2 grid gap-1">
              {suggestions.map((suggestion, index) => {
                // Calculate discount percentage
                const discountPercentage = suggestion.sale_price
                  ? calculateDiscountPercentage(
                      suggestion.price,
                      suggestion.sale_price
                    )
                  : 0;

                return (
                  <Link
                    key={suggestion.id}
                    href={`/san-pham/${suggestion.slug}`}
                    onClick={onSelectSuggestion}
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-2.5 transition-all duration-200 group",
                      validSelectedIndex === index
                        ? "bg-primary/10 shadow-sm ring-1 ring-primary/20"
                        : "hover:bg-primary/5"
                    )}
                  >
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-border/40 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-primary/30">
                      <Image
                        src={suggestion.image_url || "/placeholder.jpg"}
                        alt={suggestion.name}
                        fill
                        className="object-cover transition-all duration-300 group-hover:scale-105"
                        sizes="56px"
                      />
                      {discountPercentage > 0 && (
                        <div className="absolute top-0 right-0 bg-red-600 text-[9px] font-semibold text-white px-1 py-0.5 rounded-bl-md">
                          -{discountPercentage}%
                        </div>
                      )}
                    </div>

                    <div className="flex-grow min-w-0 space-y-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground/90 leading-tight group-hover:text-primary">
                          {suggestion.name}
                          {suggestion.brand_name && (
                            <span className="ml-1 text-[10px] text-muted-foreground">
                              ({suggestion.brand_name})
                            </span>
                          )}
                        </p>
                      </div>

                      <p className="text-xs font-semibold group-hover:translate-y-[-1px] transition-transform">
                        {suggestion.sale_price ? (
                          <Fragment>
                            <span className="text-primary">
                              {formatPrice(suggestion.sale_price)}
                            </span>
                            <span className="ml-1.5 line-through text-muted-foreground text-[10px]">
                              {formatPrice(suggestion.price)}
                            </span>
                          </Fragment>
                        ) : (
                          <span className="text-foreground/90">
                            {formatPrice(suggestion.price)}
                          </span>
                        )}
                      </p>

                      {suggestion.relevance && (
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-amber-500" />
                          <p className="text-[10px] text-muted-foreground truncate">
                            {suggestion.relevance}
                          </p>
                        </div>
                      )}

                      {/* Xem chi tiết button that appears on hover */}
                      <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 flex justify-end items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="bg-primary/5 hover:bg-primary/10 text-[10px] py-0 h-5"
                        >
                          <ExternalLink className="h-2.5 w-2.5 mr-0.5" />
                          <span>Xem chi tiết</span>
                        </Badge>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Footer information */}
            {usingFallbackModel && (
              <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border/30 bg-blue-50/40 dark:bg-blue-900/10 flex items-center gap-1.5">
                <BadgeInfo className="h-3 w-3 text-blue-500" />
                <span>Đang sử dụng model dự phòng</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-3">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>

            <p className="text-sm font-medium text-foreground/80">
              Không tìm thấy sản phẩm nào
            </p>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
              AI không tìm thấy kết quả phù hợp cho "
              <span className="font-medium">{query}</span>"
            </p>

            {usingFallbackModel && (
              <div className="mt-3 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full text-xs flex items-center gap-1.5">
                <BadgeInfo className="h-3 w-3 text-blue-500" />
                <span className="text-blue-600 dark:text-blue-400">
                  Đang sử dụng model dự phòng
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
