"use client"

import { useCartContext } from "../../providers/cart-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils/format"
import Image from "next/image"

export function OrderSummary() {
  const { cartItems, subtotal, discount, shippingFee, cartTotal, appliedDiscount } = useCartContext()

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Tóm tắt đơn hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart items summary */}
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.variant_id} className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded overflow-hidden bg-secondary/20 flex-shrink-0">
                <Image
                  src={
                    item.product?.images?.find((img: any) => img.is_main)?.image_url ||
                    item.product?.images?.[0]?.image_url ||
                    "/placeholder.jpg" ||
                    "/placeholder.svg"
                  }
                  alt={item.product?.name || "Product image"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{item.product?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.product?.volume_ml}ml × {item.quantity}
                </p>
              </div>
              <div className="text-sm font-medium">
                {formatCurrency((item.product?.sale_price || item.product?.price || 0) * item.quantity)}
              </div>
            </div>
          ))}
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
              <span>Giảm giá {appliedDiscount && `(${appliedDiscount.discount_percentage}%)`}</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-muted-foreground">Phí vận chuyển</span>
            <span className="text-green-600">Miễn phí</span>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between items-center font-semibold pt-1">
            <span>Tổng cộng</span>
            <span className="text-lg">{formatCurrency(cartTotal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

