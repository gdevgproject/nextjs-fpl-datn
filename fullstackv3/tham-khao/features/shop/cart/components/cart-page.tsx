"use client"

import { useState } from "react"
import { useCart } from "../context/cart-context"
import { CartItem } from "./cart-item"
import { EmptyCart } from "./empty-cart"
import { DiscountCodeInput } from "./discount-code-input"
import { useCartTotals } from "../hooks/use-cart-totals"
import { formatCurrency } from "../utils/cart-calculations"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, Loader2, LogIn } from "lucide-react"
import Link from "next/link"

export default function CartPage() {
  const { items, isLoading, isEmpty, clearCart, isGuest, hasInteracted } = useCart()
  const [isClearing, setIsClearing] = useState(false)
  const { subtotal, discountAmount, shippingFee, total, appliedDiscount } = useCartTotals()

  // Handle loading state
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

  // Handle empty cart state
  if (isEmpty) {
    return (
      <div className="container mx-auto py-12 px-4">
        <EmptyCart hasInteracted={hasInteracted} />
      </div>
    )
  }

  // Handle cart clearing
  const handleClearCart = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?")) {
      setIsClearing(true)
      try {
        await clearCart()
      } finally {
        setIsClearing(false)
      }
    }
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

              {/* Discount code input */}
              <div>
                <p className="text-sm mb-2">Mã giảm giá</p>
                <DiscountCodeInput subtotal={subtotal} />
              </div>

              {/* Show discount amount if applied */}
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>
                    Giảm giá
                    {appliedDiscount?.code && (
                      <span className="ml-1 font-normal text-muted-foreground">({appliedDiscount.code})</span>
                    )}
                  </span>
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

              <div className="pt-4">
                {isGuest ? (
                  <>
                    <Button asChild className="w-full" size="lg">
                      <Link href="/thanh-toan">Thanh toán với tư cách khách</Link>
                    </Button>
                    <div className="mt-2 text-center">
                      <Button variant="outline" className="w-full" size="lg" asChild>
                        <Link href={`/login?redirect=${encodeURIComponent("/thanh-toan")}`}>
                          <LogIn className="mr-2 h-4 w-4" />
                          Đăng nhập để thanh toán
                        </Link>
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Đăng nhập để lưu giỏ hàng và tích điểm thành viên
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Button asChild className="w-full" size="lg">
                      <Link href="/thanh-toan">Tiến hành thanh toán</Link>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Bằng cách tiến hành thanh toán, bạn đồng ý với các điều khoản và điều kiện của chúng tôi.
                    </p>
                  </>
                )}
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
