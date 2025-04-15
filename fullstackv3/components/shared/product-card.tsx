"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, AlertCircle } from "lucide-react";

export interface ProductCardProps {
  id: number;
  slug: string;
  name: string;
  brand_name?: string;
  image_url?: string;
  price: number;
  sale_price?: number | null;
  variant_id?: number;
  stock_quantity?: number;
  showAddToCart?: boolean;
  gender_name?: string | null;
  concentration_name?: string | null;
  perfume_type_name?: string | null;
  discount_percentage?: number;
}

export function ProductCard({
  id,
  slug,
  name,
  brand_name,
  image_url,
  price,
  sale_price,
  variant_id,
  stock_quantity = 0,
  showAddToCart = true,
  gender_name,
  concentration_name,
  perfume_type_name,
  discount_percentage,
}: ProductCardProps) {
  const isOnSale = sale_price && sale_price < price;
  const isOutOfStock = stock_quantity <= 0;

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
      <Link href={`/san-pham/${slug}`} className="block">
        {isOnSale && (
          <Badge className="absolute top-2 left-2 z-10 bg-red-500 hover:bg-red-600">
            -{discount_percentage}%
          </Badge>
        )}
        {isOutOfStock && (
          <Badge
            variant="outline"
            className="absolute top-2 right-2 z-10 bg-background/80"
          >
            Hết hàng
          </Badge>
        )}
        <div className="aspect-square relative overflow-hidden bg-muted">
          <Image
            src={image_url || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="p-4 space-y-1">
        {brand_name && (
          <Link
            href={`/thuong-hieu/${brand_name
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
          >
            <p className="text-xs text-muted-foreground font-medium hover:text-primary transition-colors">
              {brand_name}
            </p>
          </Link>
        )}
        <Link
          href={`/san-pham/${slug}`}
          className="block group-hover:text-primary transition-colors"
        >
          <h3 className="font-medium text-sm leading-tight line-clamp-2">
            {name}
          </h3>
        </Link>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {gender_name && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-5 font-normal"
            >
              {gender_name}
            </Badge>
          )}
          {concentration_name && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-5 font-normal"
            >
              {concentration_name}
            </Badge>
          )}
          {perfume_type_name && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-5 font-normal"
            >
              {perfume_type_name}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div>
            {isOnSale ? (
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(sale_price || 0)}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(price)}
                </span>
              </div>
            ) : (
              <span className="font-semibold">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(price)}
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Heart className="h-4 w-4" />
            <span className="sr-only">Add to wishlist</span>
          </Button>
        </div>
        {showAddToCart && (
          <Button
            className="w-full"
            size="sm"
            disabled
            asChild
          >
            <Link href={`/san-pham/${slug}`}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Xem chi tiết
            </Link>
          </Button>
        )}
        {isOutOfStock && (
          <div className="flex items-center text-red-600 text-sm mt-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>Hết hàng</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
