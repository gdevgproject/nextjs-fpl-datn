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

export function CartPage() {
  const { items, isLoading, isEmpty, clearCart, isGuest, hasInteracted } = useCart()
  const [isClearing, setIsClearing] = useState(false)
  const { subtotal, discountAmount, shippingFee, total } = useCartTotals()

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Đang tải giỏ hàng...</p>
      </div>
    )
  }

  // Handle empty cart state
  if (isEmpty) {
    return <EmptyCart hasInteracted={hasInteracted} />
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <ShoppingBag className="mr-2 h-6 w-6" />
        Giỏ hàng của bạn
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Sản phẩm ({items.length})</h2>
              <Button variant="outline" size="sm" onClick={handleClearCart} disabled={isClearing}>
                {isClearing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  "Xóa tất cả"
                )}
              </Button>
            </div>

            <div className="divide-y">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Cart summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {/* Discount code input */}
              <div>
                <p className="text-sm mb-2">Mã giảm giá</p>
                <DiscountCodeInput subtotal={subtotal} />
              </div>

              {/* Show discount amount if applied */}
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span>{shippingFee > 0 ? formatCurrency(shippingFee) : "Miễn phí"}</span>
              </div>

              <Separator />

              <div className="flex justify-between font-bold">
                <span>Tổng cộng</span>
                <span>{formatCurrency(total)}</span>
              </div>

              {isGuest ? (
                <div className="space-y-4">
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/login?redirect=/thanh-toan">
                      <LogIn className="mr-2 h-4 w-4" />
                      Đăng nhập để thanh toán
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" size="lg" asChild>
                    <Link href="/thanh-toan">Thanh toán với tư cách khách</Link>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Đăng nhập để lưu giỏ hàng và tích điểm thành viên
                  </p>
                </div>
              ) : (
                <>
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/thanh-toan">Tiến hành thanh toán</Link>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Bằng cách tiến hành thanh toán, bạn đồng ý với các điều khoản và điều kiện của chúng tôi.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
