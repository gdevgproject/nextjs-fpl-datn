"use client"

import { useCart } from "@/features/shop/cart/context/cart-context"
import { CartItem } from "@/features/shop/cart/components/cart-item"
import { EmptyCart } from "@/features/shop/cart/components/empty-cart"
import { DiscountCodeInput } from "@/features/shop/cart/components/discount-code-input"
import { useCartTotals } from "@/features/shop/cart/hooks/use-cart-totals"
import { formatCurrency } from "@/features/shop/cart/utils/cart-calculations"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, Loader2 } from "lucide-react"
import Link from "next/link"

export default function CartPage() {
  const { items, isLoading, isEmpty } = useCart()
  const { subtotal, discountAmount, shippingFee, total } = useCartTotals({ shippingFee: 0 })

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-medium">Đang tải giỏ hàng...</h2>
        </div>
      </div>
    )
  }

  // Show empty cart state
  if (isEmpty) {
    return (
      <div className="container mx-auto py-12 px-4">
        <EmptyCart />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <ShoppingBag className="mr-2 h-8 w-8" />
        Giỏ hàng của bạn
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Sản phẩm</h2>
              <span className="text-muted-foreground">{items.length} sản phẩm</span>
            </div>

            <Separator className="mb-4" />

            {/* Cart items list */}
            <div className="space-y-1">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Tổng đơn hàng</h2>
            <Separator className="mb-4" />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                <span>{shippingFee > 0 ? formatCurrency(shippingFee) : "Miễn phí"}</span>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng</span>
                <span>{formatCurrency(total)}</span>
              </div>

              {/* Discount code input */}
              <DiscountCodeInput subtotal={subtotal} />

              <div className="pt-4">
                <Button asChild className="w-full" size="lg">
                  <Link href="/thanh-toan">Tiến hành thanh toán</Link>
                </Button>
                <Button variant="outline" className="w-full mt-2" size="lg" asChild>
                  <Link href="/san-pham">Tiếp tục mua sắm</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
