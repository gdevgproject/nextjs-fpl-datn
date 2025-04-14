"use client";

import { useState } from "react";
import { useWishlistContext } from "../providers/wishlist-provider";
import { useAuth } from "@/features/auth/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Heart } from "lucide-react";
import Link from "next/link";
import { WishlistItem } from "./wishlist-item";
import { EmptyWishlist } from "./empty-wishlist";
import { WishlistFilter } from "./wishlist-filter";
import { Skeleton } from "@/components/ui/skeleton";

export function WishlistPage() {
  const { wishlistItems, isLoading } = useWishlistContext();
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Tính toán phân trang
  const totalItems = wishlistItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = wishlistItems.slice(startIndex, endIndex);

  // Xử lý chuyển trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Sản phẩm yêu thích</h1>
          <p className="text-muted-foreground">
            Vui lòng đăng nhập để xem danh sách sản phẩm yêu thích của bạn
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Bạn chưa đăng nhập</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              Đăng nhập để xem và quản lý danh sách sản phẩm yêu thích của bạn
            </p>
            <Button asChild className="mt-4">
              <Link href="/dang-nhap?redirect=/tai-khoan/yeu-thich">
                Đăng nhập ngay
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Sản phẩm yêu thích</h1>
          <p className="text-muted-foreground">
            Quản lý danh sách sản phẩm yêu thích của bạn
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <Skeleton className="h-full w-full" />
                </div>
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full mt-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sản phẩm yêu thích</h1>
        <p className="text-muted-foreground">
          Quản lý danh sách sản phẩm yêu thích của bạn
        </p>
      </div>

      <WishlistFilter />

      {wishlistItems.length === 0 ? (
        <EmptyWishlist />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {currentItems.map((item) => (
              <WishlistItem key={item.id} item={item} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={
                      currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(i + 1);
                      }}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        handlePageChange(currentPage + 1);
                    }}
                    className={
                      currentPage >= totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
