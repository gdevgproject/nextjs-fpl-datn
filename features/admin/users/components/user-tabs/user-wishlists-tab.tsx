"use client";

import { memo } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";

interface Wishlist {
  id: number;
  product_id: number;
  added_at: string;
  products: {
    name: string;
    slug: string;
    brand_id: number;
    brands: {
      name: string;
    };
  };
}

interface UserWishlistsTabProps {
  wishlists: Wishlist[];
  isLoading?: boolean;
}

// Format date helper
const formatDate = (dateString: string) => {
  return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
};

function UserWishlistsTabComponent({
  wishlists,
  isLoading = false,
}: UserWishlistsTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-32 mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (wishlists.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          Người dùng này chưa có sản phẩm yêu thích nào.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {wishlists.map((wishlist) => (
        <Card key={wishlist.id}>
          <CardContent className="p-4">
            <Link
              href={`/admin/products/${wishlist.products.slug}`}
              className="font-medium hover:underline block mb-1"
            >
              {wishlist.products.name}
            </Link>
            <p className="text-sm text-muted-foreground mb-3">
              Thương hiệu: {wishlist.products.brands.name}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Đã thêm: {formatDate(wishlist.added_at)}
              </span>
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/products/${wishlist.products.slug}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Xem sản phẩm
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default memo(UserWishlistsTabComponent);
