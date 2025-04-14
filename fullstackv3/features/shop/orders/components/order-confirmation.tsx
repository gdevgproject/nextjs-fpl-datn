"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { CheckCircle, Package, ShoppingCart, Loader2, Home, ArrowRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import { Separator } from "@/components/ui/separator"
import { formatOrderNumber } from "@/lib/utils/format"

interface OrderDetails {
  id: number
  order_number: string
  recipient_name: string
  recipient_phone: string
  province_city: string
  district: string
  ward: string
  street_address: string
  payment_method: {
    name: string
  }
  subtotal_amount: number
  discount_amount: number
  shipping_fee: number
  total_amount: number
  order_date: string
  order_status: {
    name: string
  }
  items: Array<{
    product_name: string
    variant_volume_ml: number
    quantity: number
    unit_price_at_order: number
  }>
}

export function OrderConfirmation({ orderId }: { orderId?: string }) {
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If no order ID, show generic success and redirect after a delay
    if (!orderId) {
      const timer = setTimeout(() => {
        router.push("/")
      }, 5000)
      return () => clearTimeout(timer)
    }

    const fetchOrderDetails = async () => {
      setLoading(true)
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase
          .from("orders")
          .select(
            `
            id,
            order_number,
            recipient_name,
            recipient_phone,
            province_city,
            district,
            ward,
            street_address,
            subtotal_amount,
            discount_amount,
            shipping_fee,
            total_amount,
            order_date,
            payment_methods(name),
            order_statuses(name),
            order_items(
              product_name,
              variant_volume_ml,
              quantity,
              unit_price_at_order
            )
          `,
          )
          .eq("id", orderId)
          .single()

        if (error) throw error

        if (data) {
          setOrder({
            ...data,
            payment_method: data.payment_methods,
            order_status: data.order_statuses,
            items: data.order_items,
          })
        } else {
          setError("Không tìm thấy thông tin đơn hàng")
        }
      } catch (err) {
        console.error("Error fetching order details:", err)
        setError("Đã xảy ra lỗi khi tải thông tin đơn hàng")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId, router])

  // Generic success message if no order ID
  if (!orderId) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600 w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Đặt hàng thành công!</h1>
        <p className="text-muted-foreground mb-8">
          Cảm ơn bạn đã mua sắm tại MyBeauty. Bạn sẽ được chuyển hướng về trang chủ trong giây lát.
        </p>
        <Button asChild>
          <Link href="/">Quay về trang chủ</Link>
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Không thể tải thông tin đơn hàng</h1>
        <p className="text-muted-foreground mb-8">{error || "Đã xảy ra lỗi không xác định"}</p>
        <Button asChild>
          <Link href="/">Quay về trang chủ</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600 w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Đặt hàng thành công!</h1>
        <p className="text-lg text-muted-foreground">
          Cảm ơn bạn đã mua sắm tại MyBeauty. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Thông tin đơn hàng {formatOrderNumber(order.id)}
          </CardTitle>
          <CardDescription>Đơn hàng đặt ngày {new Date(order.order_date).toLocaleDateString("vi-VN")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Address information */}
          <div className="space-y-2">
            <h3 className="font-semibold">Địa chỉ giao hàng</h3>
            <div className="text-sm space-y-1">
              <p>{order.recipient_name}</p>
              <p className="text-muted-foreground">{order.recipient_phone}</p>
              <p className="text-muted-foreground">
                {order.street_address}, {order.ward}, {order.district}, {order.province_city}
              </p>
            </div>
          </div>

          <Separator />

          {/* Payment method */}
          <div className="space-y-2">
            <h3 className="font-semibold">Phương thức thanh toán</h3>
            <p className="text-sm">{order.payment_method.name}</p>
          </div>

          <Separator />

          {/* Order items */}
          <div className="space-y-3">
            <h3 className="font-semibold">Sản phẩm ({order.items.length})</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div>
                    <span className="font-medium">{item.product_name}</span>
                    <span className="text-muted-foreground ml-1">
                      ({item.variant_volume_ml}ml) x {item.quantity}
                    </span>
                  </div>
                  <div>{formatCurrency(item.unit_price_at_order * item.quantity)}</div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính</span>
              <span>{formatCurrency(order.subtotal_amount)}</span>
            </div>

            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Giảm giá</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Phí vận chuyển</span>
              <span>{formatCurrency(order.shipping_fee)}</span>
            </div>

            <div className="flex justify-between font-semibold pt-2">
              <span>Tổng thanh toán</span>
              <span className="text-lg">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex flex-col sm:flex-row gap-3">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Trang chủ
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/tai-khoan/don-hang">
              Xem đơn hàng của tôi
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Shopping suggestions */}
      <div className="text-center mt-12 mb-8">
        <h2 className="text-xl font-semibold mb-4">Tiếp tục mua sắm</h2>
        <div className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/san-pham">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Tất cả sản phẩm
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/danh-muc/nuoc-hoa-nam">Nước hoa nam</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/danh-muc/nuoc-hoa-nu">Nước hoa nữ</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

