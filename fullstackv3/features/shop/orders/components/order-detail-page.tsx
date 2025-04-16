"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useOrderDetail, useCancelOrder } from "../queries"
import { OrderStatusBadge } from "./order-status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast"
import { formatPrice } from "@/lib/utils"
import { formatDate, formatPhoneNumber } from "@/lib/utils/format"
import { ArrowLeft, CheckCircle, Loader2, Package, Star, Truck, XCircle } from "lucide-react"
import { DEFAULT_AVATAR_URL } from "@/lib/constants"

interface OrderDetailPageProps {
  orderId: number
}

export function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const { data: order, isLoading, isError } = useOrderDetail(orderId)
  const cancelOrderMutation = useCancelOrder()
  const { toast } = useSonnerToast()
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  // Xử lý hủy đơn hàng
  const handleCancelOrder = async () => {
    try {
      await cancelOrderMutation.mutateAsync(orderId)

      toast("Đơn hàng đã được hủy", { description: "Đơn hàng của bạn đã được hủy thành công" })
    } catch (error) {
      toast("Hủy đơn hàng thất bại", { description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi hủy đơn hàng" })
    }
  }

  // Kiểm tra xem đơn hàng có thể hủy không
  const canCancel = order?.order_status_id === 1 || order?.order_status_id === 2 // Pending hoặc Processing

  // Kiểm tra xem sản phẩm có thể đánh giá không
  const canReview = order?.order_status_id === 4 // Delivered

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tai-khoan/don-hang">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-20 w-20" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tai-khoan/don-hang">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium">Không tìm thấy đơn hàng</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Đơn hàng không tồn tại hoặc bạn không có quyền xem đơn hàng này
            </p>
            <Button asChild className="mt-4">
              <Link href="/tai-khoan/don-hang">Quay lại danh sách đơn hàng</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tai-khoan/don-hang">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chi tiết đơn hàng #{order.id}</h1>
          <p className="text-muted-foreground">Ngày đặt: {formatDate(order.order_date)}</p>
        </div>
        <OrderStatusBadge
          status={order.order_status?.name || "Đang xử lý"}
          statusId={order.order_status_id || undefined}
          className="md:self-start"
        />
      </div>

      {/* Thông tin giao hàng */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-5 w-5" />
            Thông tin giao hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="font-medium">Người nhận</h3>
            <p className="text-sm text-muted-foreground mt-1">{order.recipient_name}</p>
            <p className="text-sm text-muted-foreground">{formatPhoneNumber(order.recipient_phone)}</p>
          </div>

          <div>
            <h3 className="font-medium">Địa chỉ giao hàng</h3>
            <p className="text-sm text-muted-foreground mt-1">{order.street_address}</p>
            <p className="text-sm text-muted-foreground">
              {order.ward}, {order.district}, {order.province_city}
            </p>
          </div>

          {order.delivery_notes && (
            <div className="sm:col-span-2">
              <h3 className="font-medium">Ghi chú</h3>
              <p className="text-sm text-muted-foreground mt-1">{order.delivery_notes}</p>
            </div>
          )}

          {order.tracking_number && (
            <div className="sm:col-span-2">
              <h3 className="font-medium">Mã vận đơn</h3>
              <p className="text-sm text-muted-foreground mt-1">{order.tracking_number}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Thông tin thanh toán */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5" />
            Thông tin đơn hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items?.map((item) => {
              const product = item.variant?.products
              const mainImage = product?.images?.find((img) => img.is_main)?.image_url || DEFAULT_AVATAR_URL

              return (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                    <Image
                      src={mainImage || "/placeholder.svg"}
                      alt={product?.name || "Sản phẩm"}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-medium line-clamp-1">
                        {product ? (
                          <Link href={`/san-pham/${product.slug}`} className="hover:underline">
                            {product.name}
                          </Link>
                        ) : (
                          item.product_name
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.variant_volume_ml}ml x {item.quantity}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">{formatPrice(item.unit_price_at_order)}</span>

                      {canReview && product && (
                        <Button variant="ghost" size="sm" asChild className="gap-1">
                          <Link href={`/san-pham/${product.slug}?review=true`}>
                            <Star className="h-4 w-4" />
                            Đánh giá
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính</span>
              <span>{formatPrice(order.subtotal_amount)}</span>
            </div>

            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Giảm giá</span>
                <span className="text-green-600">-{formatPrice(order.discount_amount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Phí vận chuyển</span>
              <span>{formatPrice(order.shipping_fee)}</span>
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between font-medium">
              <span>Tổng cộng</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </CardContent>

        {canCancel && (
          <CardFooter className="flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive">
                  Hủy đơn hàng
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận hủy đơn hàng</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Không, giữ đơn hàng</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelOrder}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={cancelOrderMutation.isPending}
                  >
                    {cancelOrderMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang hủy...
                      </>
                    ) : (
                      "Có, hủy đơn hàng"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        )}
      </Card>

      {/* Thông tin thanh toán */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="h-5 w-5" />
            Thông tin thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-medium">Phương thức thanh toán</h3>
              <p className="text-sm text-muted-foreground mt-1">{order.payment_method?.name || "Không có thông tin"}</p>
            </div>

            <div>
              <h3 className="font-medium">Trạng thái thanh toán</h3>
              <p className="text-sm mt-1">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    order.payment_status === "Paid"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
                      : order.payment_status === "Failed" || order.payment_status === "Refunded"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500"
                  }`}
                >
                  {order.payment_status === "Paid"
                    ? "Đã thanh toán"
                    : order.payment_status === "Failed"
                      ? "Thanh toán thất bại"
                      : order.payment_status === "Refunded"
                        ? "Đã hoàn tiền"
                        : "Chờ thanh toán"}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

