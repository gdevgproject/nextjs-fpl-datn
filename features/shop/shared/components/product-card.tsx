"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, AlertCircle, Loader2 } from "lucide-react";
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
  // Support for legacy format
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

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    // use prop or hook
    if (onToggleWishlist) {
      onToggleWishlist();
    } else if (productId) {
      toggleWishlist(productId);
    }
  };

  // Support both new format (product object) and legacy format (direct props)
  const productId = product?.id || id;
  const productSlug = product?.slug || slug || `product-${productId}`;
  const productName = product?.name || name || "Sản phẩm";
  const brandName = product?.brand?.name || brand_name;

  // Find main image
  const mainImage =
    product?.images?.find((img) => img.is_main)?.image_url ||
    product?.images?.[0]?.image_url ||
    image_url ||
    "/placeholder.svg";

  // Determine price and sale price
  const productPrice = product?.price ?? directPrice ?? 0;
  const productSalePrice = product?.sale_price ?? directSalePrice;

  // Determine if product is on sale
  const isOnSale =
    productSalePrice !== null &&
    productSalePrice !== undefined &&
    productSalePrice < productPrice;

  // Calculate discount percentage if product is on sale
  const discountPercentage = isOnSale
    ? Math.round(
        ((productPrice - (productSalePrice as number)) / productPrice) * 100
      )
    : 0;

  // Determine if product is out of stock
  let isOutOfStock = true;

  // Get variant ID (use first variant if available or provided variant_id)
  const productVariantId =
    variant_id ||
    (product?.variants && product.variants.length > 0
      ? product.variants[0].id
      : productId); // Sử dụng productId làm fallback thay vì undefined

  // Check stock from variants
  if (product?.variants && product.variants.length > 0) {
    // Check if any variant has stock
    isOutOfStock = !product.variants.some(
      (v) => v.stock_quantity === undefined || v.stock_quantity > 0
    );
  } else if (stock_quantity !== undefined) {
    isOutOfStock = stock_quantity <= 0;
  } else {
    isOutOfStock = false; // Default to in-stock if no stock info available
  }

  // Handle add to cart
  const handleAddToCart = async (e: React.MouseEvent) => {
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
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow transition-shadow duration-300 hover:shadow-lg">
      <Link href={`/san-pham/${productSlug}`} className="block relative">
        {isOnSale && (
          <Badge className="absolute top-3 left-3 z-10 bg-red-500 text-white shadow-sm backdrop-blur-sm">
            -{discountPercentage}%
          </Badge>
        )}
        {isOutOfStock && (
          <Badge
            variant="outline"
            className="absolute top-3 right-3 z-10 border-muted bg-background/80 text-foreground/70 backdrop-blur-sm"
          >
            Hết hàng
          </Badge>
        )}
        <div className="aspect-square relative overflow-hidden bg-muted rounded-t-2xl">
          <Image
            src={mainImage}
            alt={productName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>

      <div className="p-4 space-y-2">
        {brandName && (
          <Link
            href={`/thuong-hieu/${brandName
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors">
              {brandName}
            </p>
          </Link>
        )}
        <Link
          href={`/san-pham/${productSlug}`}
          className="block group-hover:text-primary transition-colors"
        >
          <h3 className="font-medium text-sm leading-snug text-balance line-clamp-2">
            {productName}
          </h3>
        </Link>

        <div className="flex items-center justify-between pt-1">
          <div>
            {isOnSale ? (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-primary">
                  {formatPrice(productSalePrice as number)}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(productPrice)}
                </span>
              </div>
            ) : (
              <span className="font-semibold">{formatPrice(productPrice)}</span>
            )}
          </div>

          <button
            onClick={handleToggleWishlist}
            disabled={heartLoading}
            className="h-8 w-8 flex items-center justify-center rounded-full border border-muted bg-background hover:bg-accent transition-colors"
          >
            {heartFilled ? (
              <Heart fill="currentColor" className="h-4 w-4 text-red-500" />
            ) : (
              <Heart className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">Thêm vào wishlist</span>
          </button>
        </div>

        <Button
          className="w-full mt-2"
          size="sm"
          onClick={handleAddToCart}
          disabled={isAdding || isOutOfStock || !productVariantId}
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ShoppingCart className="h-4 w-4 mr-2" />
          )}
          {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
        </Button>
      </div>
    </div>
  );
}

export default ProductCard;
