import { Separator } from "@/components/ui/separator"
import { OrderList } from "@/components/tai-khoan/order-list"
import { OrderFilter } from "@/components/tai-khoan/order-filter"

export default function OrdersPage() {
  // Dữ liệu mẫu
  const orders = [
    {
      id: 1,
      order_date: "2023-06-15T08:30:00Z",
      status: "Delivered",
      payment_status: "Paid",
      total_amount: 1250000,
      items_count: 2,
    },
    {
      id: 2,
      order_date: "2023-07-20T10:15:00Z",
      status: "Processing",
      payment_status: "Paid",
      total_amount: 850000,
      items_count: 1,
    },
    {
      id: 3,
      order_date: "2023-08-05T14:45:00Z",
      status: "Shipped",
      payment_status: "Paid",
      total_amount: 2100000,
      items_count: 3,
    },
    {
      id: 4,
      order_date: "2023-09-10T09:20:00Z",
      status: "Cancelled",
      payment_status: "Refunded",
      total_amount: 750000,
      items_count: 1,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Đơn hàng của tôi</h2>
        <p className="text-muted-foreground">Xem và quản lý các đơn hàng của bạn</p>
      </div>
      <Separator />
      <OrderFilter />
      {orders.length > 0 ? (
        <OrderList orders={orders} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="mb-2 text-lg font-medium">Chưa có đơn hàng nào</h3>
          <p className="text-sm text-muted-foreground">
            Bạn chưa có đơn hàng nào. Hãy mua sắm và quay lại đây để xem đơn hàng của bạn.
          </p>
        </div>
      )}
    </div>
  )
}

