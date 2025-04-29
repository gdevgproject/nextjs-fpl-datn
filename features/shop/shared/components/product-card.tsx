"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useAddCartItem } from "@/features/shop/cart/use-cart";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { useWishlist } from "@/features/shop/wishlist/hooks/use-wishlist";

export interface ProductImageType {
  image_url: string;
  is_main: boolean;
}

export interface ProductVariantType {
  id: number;
  price: number;
  sale_price?: number | null;
  stock_quantity?: number;
  volume_ml?: number;
}

export interface ProductBrandType {
  id?: number;
  name: string;
}

export interface ProductCardProps {
  product?: {
    id: number;
    name: string;
    slug: string;
    brand?: ProductBrandType;
    images?: ProductImageType[];
    price?: number;
    sale_price?: number | null;
    variants?: ProductVariantType[];
    defaultVariantId?: number;
  };
  id?: number;
  slug?: string;
  name?: string;
  brand_name?: string;
  image_url?: string;
  price?: number;
  sale_price?: number | null;
  variant_id?: number;
  stock_quantity?: number;
  isInWishlist?: boolean;
  onToggleWishlist?: () => void;
  isWishlistLoading?: boolean;
}

export function ProductCard({
  product,
  id,
  slug,
  name,
  brand_name,
  image_url,
  price: directPrice,
  sale_price: directSalePrice,
  variant_id,
  stock_quantity,
  isInWishlist,
  onToggleWishlist,
  isWishlistLoading,
}: ProductCardProps) {
  const { mutate: addToCart, isPending: isAdding } = useAddCartItem();
  const { toast } = useSonnerToast();
  const {
    isInWishlist: hookInList,
    toggleWishlist,
    isLoading: hookLoading,
  } = useWishlist();

  const productId = product?.id || id;
  const productSlug = product?.slug || slug || `product-${productId}`;
  const productName = product?.name || name || "Sản phẩm";
  const brandName = product?.brand?.name || brand_name;

  const mainImage =
    product?.images?.find((img) => img.is_main)?.image_url ||
    product?.images?.[0]?.image_url ||
    image_url ||
    "/placeholder.svg";

  const productPrice = product?.price ?? directPrice ?? 0;
  const productSalePrice = product?.sale_price ?? directSalePrice;
  const isOnSale = productSalePrice != null && productSalePrice < productPrice;
  const discountPercentage = isOnSale
    ? Math.round(
        ((productPrice - (productSalePrice as number)) / productPrice) * 100
      )
    : 0;

  let isOutOfStock = true;
  const productVariantId =
    variant_id ||
    (product?.variants && product.variants.length > 0
      ? product.variants[0].id
      : productId);
  if (product?.variants && product.variants.length > 0) {
    isOutOfStock = !product.variants.some(
      (v) => v.stock_quantity == null || v.stock_quantity > 0
    );
  } else if (stock_quantity != null) {
    isOutOfStock = stock_quantity <= 0;
  } else {
    isOutOfStock = false;
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(
      {
        variantId: product?.defaultVariantId || productVariantId,
        quantity: 1,
        productId: productId?.toString(),
      },
      {
        onSuccess: () => toast("Đã thêm vào giỏ hàng"),
        onError: (err) =>
          toast("Lỗi", {
            description: err?.message || "Không thể thêm vào giỏ hàng",
          }),
      }
    );
  };

  const heartFilled =
    typeof isInWishlist === "boolean"
      ? isInWishlist
      : !!productId && hookInList(productId);
  const heartLoading = isWishlistLoading || hookLoading;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-950/30 border border-gray-200 dark:border-gray-800/40 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm dark:backdrop-blur-md">
      {/* Image & overlays */}
      <Link
        href={`/san-pham/${productSlug}`}
        className="block rounded-t-2xl overflow-hidden"
      >
        <div className="relative aspect-square bg-gray-50 dark:bg-black/20 transition-all duration-300 group-hover:brightness-105">
          <Image
            src={mainImage}
            alt={productName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {isOnSale && (
            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
              -{discountPercentage}%
            </Badge>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 dark:bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <span className="text-sm font-semibold text-white uppercase tracking-wider">
                Hết hàng
              </span>
            </div>
          )}
          {/* Hover actions */}
          <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 bg-black/10 dark:bg-black/20">
            <button
              onClick={handleAddToCart}
              disabled={isAdding || isOutOfStock}
              className="p-3 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-lg hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all disabled:opacity-50 scale-90 group-hover:scale-100"
            >
              {isAdding ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleWishlist
                  ? onToggleWishlist()
                  : toggleWishlist(productId!);
              }}
              disabled={heartLoading}
              className="p-3 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-lg hover:bg-pink-500 hover:text-white dark:hover:bg-pink-500 dark:hover:text-white transition-all disabled:opacity-50 scale-90 group-hover:scale-100"
            >
              {heartFilled ? (
                <Heart
                  fill="#e11d48"
                  className="w-5 h-5 transition-transform duration-300 hover:scale-110"
                />
              ) : (
                <Heart className="w-5 h-5 transition-transform duration-300 hover:scale-110" />
              )}
            </button>
          </div>
        </div>
      </Link>

      {/* Details */}
      <div className="p-4 space-y-2 dark:bg-gradient-to-b dark:from-gray-900/5 dark:to-gray-900/30">
        {brandName && (
          <Link
            href={`/thuong-hieu/${brandName
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary/80 transition-colors">
              {brandName}
            </p>
          </Link>
        )}
        <Link href={`/san-pham/${productSlug}`}>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-primary/90 transition-colors line-clamp-2">
            {productName}
          </h3>
        </Link>
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            {isOnSale ? (
              <>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  {formatPrice(productSalePrice as number)}
                </span>
                <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                  {formatPrice(productPrice)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatPrice(productPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
