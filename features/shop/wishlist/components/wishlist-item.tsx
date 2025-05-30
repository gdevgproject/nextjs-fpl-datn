"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useAddCartItem } from "@/features/shop/cart/use-cart";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { DEFAULT_AVATAR_URL } from "@/lib/constants";
import { useWishlist } from "../hooks/use-wishlist";
import type { WishlistItem as WishlistItemType } from "../hooks/use-wishlist";

interface WishlistItemProps {
  item: WishlistItemType;
}

export function WishlistItem({ item }: WishlistItemProps) {
  const { removeFromWishlist } = useWishlist();
  const { mutateAsync: addToCart, isPending: isAddingToCart } =
    useAddCartItem();
  const { toast } = useSonnerToast();
  const [isRemoving, setIsRemoving] = useState(false);

  const product = item.product;
  const mainImage =
    product.images?.find((img: any) => img.is_main)?.image_url ||
    DEFAULT_AVATAR_URL;
  const hasDiscount =
    product.sale_price !== null && product.sale_price < product.price;

  // Xử lý xóa khỏi danh sách yêu thích
  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      await removeFromWishlist(item.product_id);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async () => {
    try {
      await addToCart({ variantId: product.id, quantity: 1 });

      toast("Đã thêm vào giỏ hàng", {
        description: `${product.name} đã được thêm vào giỏ hàng của bạn.`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast("Thêm vào giỏ hàng thất bại", {
        description: "Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng.",
      });
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Link href={`/san-pham/${product.slug}`}>
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={mainImage || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>
        <div className="p-4">
          <Link
            href={`/san-pham/${product.slug}`}
            className="line-clamp-2 font-medium hover:underline"
          >
            {product.name}
          </Link>
          <div className="mt-2 flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="font-medium text-primary">
                  {formatPrice(product.sale_price!)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="font-medium text-primary">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 p-4 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleRemove}
          disabled={isRemoving || isAddingToCart}
        >
          {isRemoving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xóa...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </>
          )}
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={isRemoving || isAddingToCart}
        >
          {isAddingToCart ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang thêm...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Thêm vào giỏ
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
