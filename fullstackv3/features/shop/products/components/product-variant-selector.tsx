"use client";

import { useState } from "react";
import { Heart, Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthQuery } from "@/features/auth/hooks";
import { useCartContext } from "@/features/shop/cart/providers/cart-provider";
import { useWishlist } from "@/features/shop/wishlist/hooks/use-wishlist";
import { formatPrice } from "@/lib/utils";

interface ProductVariantSelectorProps {
  product: any;
}

export function ProductVariantSelector({
  product,
}: ProductVariantSelectorProps) {
  const { toast } = useToast();
  const { data: session } = useAuthQuery();
  const isAuthenticated = !!session?.user;
  const { addToCart } = useCartContext();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  // Lọc các variants có hiệu lực
  const variants = (product.variants || []).filter((v: any) => !v.deleted_at);

  // Tự động chọn variant đầu tiên nếu chỉ có một variant
  if (variants.length === 1 && !selectedVariantId) {
    setSelectedVariantId(variants[0].id);
  }

  // Lấy thông tin variant đã chọn
  const selectedVariant = variants.find((v: any) => v.id === selectedVariantId);

  // Kiểm tra xem sản phẩm có trong danh sách yêu thích không
  const isWishlisted = isInWishlist(product.id);

  // Xử lý khi thay đổi variant
  const handleVariantChange = (value: string) => {
    setSelectedVariantId(Number(value));
  };

  // Xử lý khi thay đổi số lượng
  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const newQuantity = prev + delta;
      return newQuantity > 0 ? newQuantity : 1;
    });
  };

  // Xử lý khi thêm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!selectedVariantId) {
      toast({
        title: "Vui lòng chọn dung tích",
        description: "Hãy chọn dung tích sản phẩm trước khi thêm vào giỏ hàng",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart(selectedVariantId, quantity, product.id.toString());

      toast({
        title: "Đã thêm vào giỏ hàng",
        description: `${product.name} đã được thêm vào giỏ hàng của bạn.`,
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

  // Xử lý khi thêm/xóa khỏi danh sách yêu thích
  const handleToggleWishlist = async () => {
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

  const isOutOfStock = selectedVariant && selectedVariant.stock_quantity <= 0;

  return (
    <div className="space-y-6">
      {/* Chọn variant */}
      {variants.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Dung tích</h3>
            {selectedVariant && (
              <p className="text-sm text-muted-foreground">
                {isOutOfStock ? (
                  <span className="text-red-500">
                    Hết hàng - Vui lòng chọn sản phẩm khác
                  </span>
                ) : (
                  <>
                    Còn lại:{" "}
                    <span className="font-medium">
                      {selectedVariant.stock_quantity}
                    </span>{" "}
                    sản phẩm
                  </>
                )}
              </p>
            )}
          </div>
          <RadioGroup
            value={selectedVariantId?.toString()}
            onValueChange={handleVariantChange}
          >
            <div className="flex flex-wrap gap-3">
              {variants.map((variant: any) => (
                <div key={variant.id} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={variant.id.toString()}
                    id={`variant-${variant.id}`}
                    className="peer sr-only"
                    disabled={variant.stock_quantity <= 0}
                  />
                  <Label
                    htmlFor={`variant-${variant.id}`}
                    className="flex cursor-pointer items-center justify-center rounded-md border border-muted bg-background px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                  >
                    {variant.volume_ml}ml
                    {variant.sale_price ? (
                      <span className="ml-2 text-primary">
                        {formatPrice(variant.sale_price)}
                      </span>
                    ) : (
                      <span className="ml-2">{formatPrice(variant.price)}</span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Chọn số lượng */}
      <div className="space-y-2">
        <h3 className="font-medium">Số lượng</h3>
        <div className="flex w-32 items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-r-none"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
          >
            <Minus className="h-3 w-3" />
            <span className="sr-only">Giảm số lượng</span>
          </Button>
          <div className="flex h-8 w-10 items-center justify-center border-y border-input bg-transparent text-center text-sm">
            {quantity}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-l-none"
            onClick={() => handleQuantityChange(1)}
            disabled={
              selectedVariant && quantity >= selectedVariant.stock_quantity
            }
          >
            <Plus className="h-3 w-3" />
            <span className="sr-only">Tăng số lượng</span>
          </Button>
        </div>
      </div>

      {/* Nút thêm vào giỏ hàng và yêu thích */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          className="flex-1 gap-2"
          onClick={handleAddToCart}
          disabled={isAddingToCart || !selectedVariantId || isOutOfStock}
        >
          {isAddingToCart ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang thêm...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Thêm vào giỏ hàng
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className={`gap-2 ${
            isWishlisted
              ? "border-primary text-primary hover:bg-primary/10"
              : ""
          }`}
          onClick={handleToggleWishlist}
          disabled={isTogglingWishlist}
        >
          {isTogglingWishlist ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart
              className={`h-4 w-4 ${isWishlisted ? "fill-primary" : ""}`}
            />
          )}
          {isWishlisted ? "Đã yêu thích" : "Thêm vào yêu thích"}
        </Button>
      </div>
    </div>
  );
}
