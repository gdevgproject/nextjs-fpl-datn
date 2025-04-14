import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils/format"
import { useCartContext } from "../../cart/providers/cart-provider"

export function OrderSummary() {
  const { cartItems, subtotal, discount, shippingFee, cartTotal, appliedDiscount } = useCartContext()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-3">Chi tiết đơn hàng</h3>
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.variant_id} className="flex justify-between text-sm">
              <div className="flex-1">
                <span className="font-medium">{item.product?.name}</span>
                <span className="text-muted-foreground"> × {item.quantity}</span>
              </div>
              <div className="text-right">
                {formatCurrency((item.product?.sale_price || item.product?.price || 0) * item.quantity)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

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
    </div>
  )
}

