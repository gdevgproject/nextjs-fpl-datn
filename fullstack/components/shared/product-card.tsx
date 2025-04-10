"use client";

import type React from "react";
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/lib/providers/auth-context";
import { useWishlistContext } from "@/features/wishlist/providers/wishlist-provider";
import { useCartContext } from "@/features/cart/providers/cart-provider";
import type { Product } from "@/features/products/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlistContext();
  const { addToCart } = useCartContext();
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Đảm bảo product.slug tồn tại
  const productSlug = product.slug || `product-${product.id}`;

  // Tìm ảnh chính hoặc sử dụng ảnh đầu tiên
  const mainImage =
    product.images?.find((img) => img.is_main)?.image_url ||
    product.images?.[0]?.image_url ||
    `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(
      product.name
    )}`;

  // Kiểm tra xem sản phẩm có giảm giá không
  const hasDiscount =
    product.sale_price !== null &&
    product.sale_price !== undefined &&
    product.sale_price > 0 &&
    product.price !== undefined &&
    product.sale_price < product.price;

  // Kiểm tra xem sản phẩm có trong danh sách yêu thích không
  const isWishlisted = isInWishlist(product.id);

  // Determine the best variant to display and use for cart operations - done once at component mount
  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return null;
    }

    // Filter out-of-stock variants first if stock info is available
    const inStockVariants = product.variants.filter(
      (v) => v.stock_quantity === undefined || v.stock_quantity > 0
    );

    // Use in-stock variants if available, otherwise use all variants
    const variantsToConsider =
      inStockVariants.length > 0 ? inStockVariants : product.variants;

    let bestVariant;

    if (
      hasDiscount &&
      product.sale_price !== undefined &&
      product.price !== undefined
    ) {
      // If product has discount, find a variant with matching sale price
      bestVariant = variantsToConsider.find(
        (v) => v.sale_price === product.sale_price
      );

      // If no exact match, find the closest sale price
      if (!bestVariant) {
        bestVariant = variantsToConsider.reduce((closest, current) => {
          if (!closest.sale_price) return current;
          if (!current.sale_price) return closest;

          const closestDiff = Math.abs(
            (closest.sale_price || 0) - (product.sale_price || 0)
          );
          const currentDiff = Math.abs(
            (current.sale_price || 0) - (product.sale_price || 0)
          );

          return currentDiff < closestDiff ? current : closest;
        }, variantsToConsider[0]);
      }
    } else if (product.price !== undefined) {
      // If no discount, find variant with matching regular price
      bestVariant = variantsToConsider.find((v) => v.price === product.price);

      // If no exact match, find the closest price
      if (!bestVariant && product.price !== undefined) {
        bestVariant = variantsToConsider.reduce((closest, current) => {
          const closestDiff = Math.abs(closest.price - (product.price || 0));
          const currentDiff = Math.abs(current.price - (product.price || 0));

          return currentDiff < closestDiff ? current : closest;
        }, variantsToConsider[0]);
      }
    }

    return bestVariant || variantsToConsider[0];
  }, [product.variants, product.price, product.sale_price, hasDiscount]);

  // Fetch product labels
  const { data: labels } = useQuery({
    queryKey: ["productLabels", product.id],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("product_label_assignments")
        .select("label:product_labels(*)")
        .eq("product_id", product.id);

      if (error) {
        console.error("Error fetching product labels:", error);
        return [];
      }
      return data?.map((item: any) => item.label) || [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Fetch average rating
  const { data: avgRating } = useQuery({
    queryKey: ["averageRating", product.id],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", product.id)
        .eq("is_approved", true);

      if (error) {
        console.error("Error fetching average rating:", error);
        return 0;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      const totalRating = data.reduce(
        (sum: number, review: any) => sum + review.rating,
        0
      );
      return totalRating / data.length;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  // Determine the volume of the selected variant
  const volume = selectedVariant?.volume_ml || null;

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsAddingToCart(true);

      // Kiểm tra variant đã chọn
      if (!selectedVariant) {
        toast({
          title: "Không thể thêm vào giỏ hàng",
          description:
            "Sản phẩm này hiện không có biến thể nào hoặc đã hết hàng.",
          variant: "destructive",
        });
        return;
      }

      // Kiểm tra variant có ID không
      if (!selectedVariant.id) {
        toast({
          title: "Không thể thêm vào giỏ hàng",
          description: "Không thể xác định biến thể sản phẩm.",
          variant: "destructive",
        });
        return;
      }

      // Kiểm tra tồn kho - bỏ qua nếu không có thông tin stock_quantity hoặc số lượng > 0
      if (
        selectedVariant.stock_quantity !== undefined &&
        selectedVariant.stock_quantity <= 0
      ) {
        toast({
          title: "Không thể thêm vào giỏ hàng",
          description: "Sản phẩm này hiện đã hết hàng.",
          variant: "destructive",
        });
        return;
      }

      // Thêm vào giỏ hàng sử dụng variant đã chọn
      await addToCart(selectedVariant.id, 1, product.id.toString());

      toast({
        title: "Đã thêm vào giỏ hàng",
        description: `${product.name} ${
          selectedVariant.volume_ml ? `(${selectedVariant.volume_ml}ml)` : ""
        } đã được thêm vào giỏ hàng.`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Thêm vào giỏ hàng thất bại",
        description: "Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Xử lý thêm/xóa khỏi danh sách yêu thích
  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsTogglingWishlist(true);

      if (!isAuthenticated) {
        toast({
          title: "Vui lòng đăng nhập",
          description:
            "Bạn cần đăng nhập để thêm sản phẩm vào danh sách yêu thích.",
          variant: "default",
        });
        return;
      }

      await toggleWishlist(product.id);
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Link href={`/san-pham/${productSlug}`}>
          <div className="relative aspect-square overflow-hidden">
            {isImageLoading && (
              <Skeleton className="absolute inset-0 h-full w-full" />
            )}
            <Image
              src={mainImage || "/placeholder.svg"}
              alt={product.name}
              fill
              className={`object-cover transition-all duration-300 ${
                isImageLoading ? "opacity-0" : "opacity-100 hover:scale-105"
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
            {hasDiscount &&
              product.price !== undefined &&
              product.sale_price !== undefined && (
                <Badge className="absolute left-2 top-2 bg-red-500 hover:bg-red-600">
                  -
                  {Math.round(
                    ((product.price - product.sale_price) / product.price) * 100
                  )}
                  %
                </Badge>
              )}
            <Button
              variant="secondary"
              size="icon"
              className={`absolute right-2 top-2 z-10 h-8 w-8 rounded-full shadow-md ${
                isWishlisted
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-white text-gray-700 hover:bg-white/90"
              }`}
              onClick={handleToggleWishlist}
              disabled={isTogglingWishlist}
            >
              {isTogglingWishlist ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart
                  className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`}
                />
              )}
              <span className="sr-only">
                {isWishlisted
                  ? "Xóa khỏi danh sách yêu thích"
                  : "Thêm vào yêu thích"}
              </span>
            </Button>
          </div>
        </Link>
        <div className="p-4">
          {product.brand && (
            <div className="text-xs text-muted-foreground">
              {product.brand.name}
            </div>
          )}
          <Link
            href={`/san-pham/${productSlug}`}
            className="line-clamp-2 mt-1 font-medium hover:underline"
          >
            {product.name}
          </Link>
          <div className="mt-2 flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="font-medium text-primary">
                  {product.sale_price !== undefined
                    ? formatPrice(product.sale_price)
                    : ""}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {product.price !== undefined
                    ? formatPrice(product.price)
                    : ""}
                </span>
              </>
            ) : (
              <span className="font-medium text-primary">
                {product.price !== undefined ? formatPrice(product.price) : ""}
              </span>
            )}
            {/* Display volume if it's a perfume product */}
            {volume && (
              <span className="text-sm text-muted-foreground">{volume}ml</span>
            )}
          </div>
          {/* Product Labels */}
          {labels && labels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {labels.map((label) => (
                <Badge
                  key={label.id}
                  className="bg-secondary text-secondary-foreground"
                >
                  {label.name}
                </Badge>
              ))}
            </div>
          )}
          {/* Average Rating */}
          {avgRating > 0 && (
            <div className="mt-2 flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">
                {avgRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={isAddingToCart || !selectedVariant}
        >
          {isAddingToCart ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang thêm...
            </>
          ) : !selectedVariant ? (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Hết hàng
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Thêm vào giỏ hàng
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
