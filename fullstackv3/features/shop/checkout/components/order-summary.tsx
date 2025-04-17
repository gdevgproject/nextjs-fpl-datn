import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils/format";
import { useCartQuery } from "@/features/shop/cart/use-cart";
import { useShopSettings } from "@/features/shop/shared/hooks/use-shop-settings";
import { useCheckout } from "@/features/shop/checkout/checkout-provider";

export function OrderSummary() {
  const { data: cartItems = [] } = useCartQuery();
  const { settings } = useShopSettings();
  const { discountAmount, appliedDiscount } = useCheckout();
  const shippingFee = settings?.shipping_fee || 0;
  const freeThreshold = settings?.free_shipping_threshold ?? null;

  // compute subtotal & total
  const subtotal = cartItems.reduce((sum, item) => {
    const price =
      item.product?.sale_price && item.product.sale_price < item.product.price
        ? item.product.sale_price
        : item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  // Tính tổng khuyến mãi từ giá sản phẩm (chênh lệch giữa price và sale_price)
  const saleDiscount = cartItems.reduce((sum, item) => {
    const originalPrice = item.product?.price || 0;
    const salePrice = item.product?.sale_price || originalPrice;
    return (
      sum +
      (originalPrice > salePrice
        ? (originalPrice - salePrice) * item.quantity
        : 0)
    );
  }, 0);

  const isFree = freeThreshold !== null && subtotal >= freeThreshold;
  const finalShipping = isFree ? 0 : shippingFee;
  const total = subtotal - discountAmount + finalShipping;

  return (
    <div className="space-y-4">
      <h3 className="font-medium mb-3">Chi tiết đơn hàng</h3>
      <div className="space-y-3">
        {cartItems.map((item) => (
          <div key={item.variant_id} className="flex justify-between text-sm">
            <div className="flex-1">
              <span className="font-medium">{item.product?.name}</span>
              <span className="text-muted-foreground"> × {item.quantity}</span>
            </div>
            <div className="text-right">
              {formatCurrency(
                ((item.product?.sale_price ?? item.product?.price) || 0) *
                  item.quantity
              )}
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tạm tính</span>
          <span>{formatCurrency(subtotal + saleDiscount)}</span>
        </div>

        {/* Hiển thị dòng khuyến mãi sản phẩm khi có sản phẩm được giảm giá */}
        {saleDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Khuyến mãi sản phẩm</span>
            <span>-{formatCurrency(saleDiscount)}</span>
          </div>
        )}

        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>
              Giảm giá{" "}
              {appliedDiscount?.discount_percentage
                ? `(${appliedDiscount.discount_percentage}%)`
                : ""}
            </span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-muted-foreground">Phí vận chuyển</span>
          {finalShipping > 0 ? (
            <span>{formatCurrency(finalShipping)}</span>
          ) : (
            <span className="text-green-600">Miễn phí</span>
          )}
        </div>

        <Separator className="my-2" />

        <div className="flex justify-between items-center font-semibold pt-1">
          <span>Tổng cộng</span>
          <span className="text-lg">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
