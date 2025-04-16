"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartContext } from "@/features/shop/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  ShoppingBag,
  Loader2,
  Receipt,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateDiscountCode } from "../cart-actions";
import { EmptyCart } from "./empty-cart";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

export function CartPage() {
  const {
    cartItems,
    cartItemCount,
    updateCartItemQuantity,
    removeCartItem,
    subtotal,
    discount,
    shippingFee,
    cartTotal,
    discountCode,
    setDiscountCode,
    applyDiscount,
    removeDiscount,
    appliedDiscount,
    isUpdatingCart,
  } = useCartContext();

  const { success, error, info, warning, toast } = useSonnerToast();

  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [localDiscountCode, setLocalDiscountCode] = useState(
    discountCode || ""
  );

  // Handle applying discount code
  const handleApplyDiscount = async () => {
    if (!localDiscountCode.trim()) {
      setDiscountError("Vui lòng nhập mã giảm giá");
      return;
    }

    setIsApplyingDiscount(true);
    setDiscountError(null);

    try {
      const result = await validateDiscountCode(localDiscountCode, subtotal);

      if (result.success && result.data) {
        // Apply the discount to the cart
        applyDiscount(
          localDiscountCode,
          result.data.discount,
          result.data.discountAmount
        );
        setDiscountError(null);

        // Show success message
        success(`Đã áp dụng mã giảm giá ${localDiscountCode}`);
      } else {
        setDiscountError(result.error || "Mã giảm giá không hợp lệ");
      }
    } catch (err) {
      console.error("Error applying discount:", err);
      setDiscountError("Đã xảy ra lỗi khi áp dụng mã giảm giá");
      error &&
        typeof error === "function" &&
        error("Đã xảy ra lỗi khi áp dụng mã giảm giá");
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  // Handle removing discount code
  const handleRemoveDiscount = () => {
    removeDiscount();
    setLocalDiscountCode("");
    setDiscountError(null);
  };

  // If cart is empty, show empty state
  if (cartItemCount === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="container py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  Sản phẩm ({cartItemCount})
                </h2>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.variant_id}
                  className="py-4 border-b last:border-0"
                >
                  <div className="flex items-start gap-4">
                    {/* Product image */}
                    <div className="relative w-20 h-20 rounded overflow-hidden bg-secondary/20 flex-shrink-0">
                      <Image
                        src={
                          item.product?.images?.find((img: any) => img.is_main)
                            ?.image_url ||
                          item.product?.images?.[0]?.image_url ||
                          "/placeholder.jpg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt={item.product?.name || "Product image"}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium line-clamp-2">
                            {item.product?.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.product?.volume_ml}ml
                          </p>

                          {/* Price */}
                          <div className="mt-1">
                            {item.product?.sale_price ? (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {formatCurrency(item.product.sale_price)}
                                </span>
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatCurrency(item.product.price)}
                                </span>
                              </div>
                            ) : (
                              <span className="font-medium">
                                {formatCurrency(item.product?.price || 0)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Remove button - mobile only */}
                        <div className="md:hidden">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeCartItem(item.variant_id)}
                            disabled={isUpdatingCart}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Quantity control and subtotal */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() =>
                              updateCartItemQuantity(
                                item.variant_id,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            disabled={item.quantity <= 1 || isUpdatingCart}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          <div className="w-10 text-center font-medium text-sm py-1">
                            {isUpdatingCart ? (
                              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            ) : (
                              item.quantity
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() =>
                              updateCartItemQuantity(
                                item.variant_id,
                                item.quantity + 1
                              )
                            }
                            disabled={isUpdatingCart}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Item total */}
                          <span className="font-medium">
                            {formatCurrency(
                              (item.product?.sale_price ||
                                item.product?.price ||
                                0) * item.quantity
                            )}
                          </span>

                          {/* Remove button - desktop only */}
                          <div className="hidden md:block">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeCartItem(item.variant_id)}
                              disabled={isUpdatingCart}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue shopping button */}
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link href="/san-pham">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Tiếp tục mua sắm
              </Link>
            </Button>
          </div>
        </div>

        {/* Order summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Discount code input */}
              <div>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Nhập mã giảm giá"
                      value={localDiscountCode}
                      onChange={(e) => setLocalDiscountCode(e.target.value)}
                      disabled={!!appliedDiscount || isApplyingDiscount}
                    />
                  </div>
                  {appliedDiscount ? (
                    <Button
                      variant="destructive"
                      onClick={handleRemoveDiscount}
                    >
                      Xóa
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={handleApplyDiscount}
                      disabled={isApplyingDiscount}
                    >
                      {isApplyingDiscount ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Receipt className="h-4 w-4 mr-2" />
                      )}
                      Áp dụng
                    </Button>
                  )}
                </div>

                {/* Discount error */}
                {discountError && (
                  <div className="mt-2">
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{discountError}</AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Applied discount info */}
                {appliedDiscount && (
                  <div className="mt-2 text-sm text-green-600">
                    Đã áp dụng: {appliedDiscount.code} (
                    {appliedDiscount.discount_percentage}%)
                  </div>
                )}
              </div>

              <Separator />

              {/* Price details */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Giảm giá{" "}
                      {appliedDiscount &&
                        `(${appliedDiscount.discount_percentage}%)`}
                    </span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  {shippingFee > 0 ? (
                    <span>{formatCurrency(shippingFee)}</span>
                  ) : (
                    <span className="text-green-600">Miễn phí</span>
                  )}
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between items-center font-semibold pt-1">
                  <span>Tổng cộng</span>
                  <span className="text-lg">{formatCurrency(cartTotal)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild size="lg" className="w-full">
                <Link href="/thanh-toan">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Tiến hành thanh toán
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
