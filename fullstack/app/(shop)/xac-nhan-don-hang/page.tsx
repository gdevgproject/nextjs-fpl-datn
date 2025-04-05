"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getOrderDetails } from "@/features/orders/queries";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Loader2, CheckCircle, ShoppingBag } from "lucide-react";
import { useCheckout } from "@/features/cart/providers/checkout-provider";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const token = searchParams.get("token");
  const { setJustPlacedOrder } = useCheckout();

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reset the justPlacedOrder flag when navigating to order confirmation page
  useEffect(() => {
    // Reset the flag after a short delay to ensure checkout navigation completes
    const timer = setTimeout(() => {
      setJustPlacedOrder(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [setJustPlacedOrder]);

  // Fetch order details
  useEffect(() => {
    if (!orderId && !token) {
      setError("Không tìm thấy thông tin đơn hàng");
      setIsLoading(false);
      return;
    }

    async function fetchOrderDetails() {
      try {
        let result;
        if (token) {
          // If we have a token, use it for guest order access
          result = await getOrderDetails(token, true);
        } else if (orderId) {
          // Otherwise use orderId for authenticated users
          result = await getOrderDetails(orderId, false);
        } else {
          throw new Error("Không tìm thấy thông tin đơn hàng");
        }

        if (result.success && result.data) {
          setOrder(result.data);
        } else {
          setError(result.error || "Không thể tải thông tin đơn hàng");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Đã xảy ra lỗi khi tải thông tin đơn hàng");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrderDetails();
  }, [orderId, token]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="container py-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold">Đang tải thông tin đơn hàng...</h2>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !order) {
    return (
      <div className="container py-16 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Không tìm thấy đơn hàng</CardTitle>
            <CardDescription>
              {error || "Không thể tải thông tin đơn hàng"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="mt-4">
              <Link href="/san-pham">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Tiếp tục mua sắm
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Đặt hàng thành công!</h1>
          <p className="text-lg text-muted-foreground">
            Cảm ơn bạn đã mua hàng tại MyBeauty
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl">
                  Đơn hàng #{order.order_number}
                </CardTitle>
                <CardDescription>
                  Ngày đặt: {formatDate(order.created_at)}
                </CardDescription>
              </div>
              <div className="px-4 py-2 bg-primary/10 text-primary rounded-md font-medium">
                {order.status}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-lg mb-2">
                  Thông tin khách hàng
                </h3>
                <ul className="space-y-1 text-sm">
                  <li>
                    <span className="text-muted-foreground">Tên:</span>{" "}
                    {order.customer_name}
                  </li>
                  <li>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {order.customer_email}
                  </li>
                  <li>
                    <span className="text-muted-foreground">
                      Số điện thoại:
                    </span>{" "}
                    {order.customer_phone}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">Địa chỉ giao hàng</h3>
                <p className="text-sm">{order.shipping_address}</p>
              </div>
            </div>

            <Separator />

            {/* Order details */}
            <div>
              <h3 className="font-medium text-lg mb-2">Chi tiết đơn hàng</h3>
              <div className="space-y-4">
                {/* Order items */}
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-secondary/20">
                      <Image
                        src={item.product_image || "/images/default-avatar.png"}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.variant_attributes} - SL: {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Order summary */}
                <div className="mt-4 space-y-2 text-sm border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>

                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Phí vận chuyển:
                    </span>
                    <span>{formatCurrency(order.shipping_fee)}</span>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Tổng cộng:</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment & Shipping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-lg mb-2">
                  Phương thức thanh toán
                </h3>
                <p>{order.payment_method}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Trạng thái: {order.payment_status}
                </p>

                {/* Show bank details if payment method is bank transfer */}
                {order.payment_method.includes("chuyển khoản") && (
                  <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                    <p className="font-medium">Thông tin chuyển khoản:</p>
                    <div className="mt-1">
                      <p>
                        Ngân hàng:{" "}
                        <span className="font-medium">
                          BIDV - Ngân hàng TMCP Đầu tư và Phát triển Việt Nam
                        </span>
                      </p>
                      <p>
                        Số tài khoản:{" "}
                        <span className="font-medium">1234567890</span>
                      </p>
                      <p>
                        Chủ tài khoản:{" "}
                        <span className="font-medium">
                          CÔNG TY TNHH MYBEAUTY
                        </span>
                      </p>
                      <p>
                        Nội dung:{" "}
                        <span className="font-medium">
                          Thanh toan #{order.order_number}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">
                  Phương thức vận chuyển
                </h3>
                <p>{order.shipping_method}</p>
                {order.delivery_notes && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Ghi chú:</p>
                    <p className="text-sm">{order.delivery_notes}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/san-pham">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Tiếp tục mua sắm
            </Link>
          </Button>
          <Button asChild>
            <Link href="/tai-khoan/don-hang">Xem đơn hàng của tôi</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
