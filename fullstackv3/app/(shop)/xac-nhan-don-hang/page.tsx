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
import { CheckCircle, ShoppingBag } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { OrderConfirmationClient } from "@/features/shop/order-confirmation/components/order-confirmation-client";
import { CopyAccessToken } from "@/features/shop/order-confirmation/components/copy-access-token";

// Server-side fetch for order details
async function getOrderServerSide(
  orderId: string | null,
  token: string | null
) {
  const { getOrderDetails } = await import(
    "@/features/shop/order-confirmation/actions"
  );

  if (!orderId && !token) {
    return { error: "Không tìm thấy thông tin đơn hàng", data: null };
  }

  try {
    if (token) {
      // Get order details using access token (for guest users)
      const result = await getOrderDetails(token, true);
      return result;
    } else if (orderId) {
      // Get order details using orderId (for authenticated users)
      const result = await getOrderDetails(orderId);
      return result;
    } else {
      return { error: "Không tìm thấy thông tin đơn hàng", data: null };
    }
  } catch (err) {
    console.error("Error fetching order:", err);
    return {
      error: "Đã xảy ra lỗi khi lấy thông tin đơn hàng",
      data: null,
    };
  }
}

export default async function OrderConfirmationPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Next.js App Router 15+: searchParams là Promise
  const searchParams = await props.searchParams;
  const orderId =
    typeof searchParams.orderId === "string" ? searchParams.orderId : null;
  const token =
    typeof searchParams.token === "string" ? searchParams.token : null;

  const { data: order, error } = await getOrderServerSide(orderId, token);

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      {/* Client component for state management, doesn't render anything */}
      <OrderConfirmationClient />

      {error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Không tìm thấy đơn hàng</h3>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button asChild className="mt-4">
              <Link href="/san-pham">Tiếp tục mua sắm</Link>
            </Button>
          </CardContent>
        </Card>
      ) : order ? (
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h2>
              <p className="text-muted-foreground">
                Cảm ơn bạn đã đặt hàng. Chúng tôi đã gửi email xác nhận đơn
                hàng.
              </p>

              {/* Display order access token for guests with copy functionality */}
              {order.access_token && (
                <div className="mt-4 w-full max-w-md">
                  <CopyAccessToken accessToken={order.access_token} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Đơn hàng #{order.order_number}</CardTitle>
                  <CardDescription>
                    Ngày đặt: {formatDate(order.created_at)}
                  </CardDescription>
                </div>
                <span className="py-1 px-3 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {order.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-medium mb-2">Thông tin khách hàng</h3>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">Họ tên:</p>
                      <p>{order.customer_name}</p>
                    </div>
                    {order.customer_email && (
                      <div>
                        <p className="text-muted-foreground">Email:</p>
                        <p>{order.customer_email}</p>
                      </div>
                    )}
                    {order.customer_phone && (
                      <div>
                        <p className="text-muted-foreground">Số điện thoại:</p>
                        <p>{order.customer_phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping & Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Địa chỉ giao hàng</h3>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    <p>{order.shipping_address}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Phương thức thanh toán</h3>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    <p>{order.payment_method}</p>
                    <p className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          order.payment_status === "Paid"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
                            : order.payment_status === "Failed"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500"
                        }`}
                      >
                        {order.payment_status === "Paid"
                          ? "Đã thanh toán"
                          : order.payment_status === "Failed"
                          ? "Thanh toán thất bại"
                          : "Chờ thanh toán"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-medium mb-3">Chi tiết đơn hàng</h3>
                <div className="border rounded-md">
                  <div className="divide-y">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center p-3 gap-3"
                      >
                        <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 border">
                          {item.product_image ? (
                            <Image
                              src={item.product_image}
                              alt={item.product_name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{item.product_name}</p>
                            {item.is_deleted && (
                              <span className="ml-2 px-2 py-0.5 rounded bg-destructive/10 text-destructive text-xs">
                                Đã ngừng kinh doanh
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.variant_attributes} x {item.quantity}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {item.sale_price &&
                            item.sale_price < item.original_price ? (
                              <>
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatCurrency(item.original_price)}
                                </span>
                                <span className="text-xs text-green-600 font-semibold">
                                  {formatCurrency(item.price)}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs">
                                {formatCurrency(item.price)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-medium mb-3">Tổng cộng</h3>
                <div className="bg-muted p-3 rounded-md">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tạm tính</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    {order.discount_product > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Giảm giá sản phẩm</span>
                        <span>-{formatCurrency(order.discount_product)}</span>
                      </div>
                    )}
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Giảm giá đơn hàng</span>
                        <span>-{formatCurrency(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Phí vận chuyển</span>
                      <span>{formatCurrency(order.shipping_fee)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Tổng cộng</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/tai-khoan/don-hang">Xem đơn hàng của tôi</Link>
            </Button>
            <Button asChild>
              <Link href="/san-pham">Tiếp tục mua sắm</Link>
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Không có thông tin đơn hàng</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Vui lòng kiểm tra lại thông tin đơn hàng của bạn
            </p>
            <Button asChild className="mt-4">
              <Link href="/san-pham">Tiếp tục mua sắm</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
