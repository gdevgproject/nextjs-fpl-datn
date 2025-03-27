import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { OrderStatus } from "@/components/tai-khoan/order-status"
import { OrderItems } from "@/components/tai-khoan/order-items"
import { OrderSummary } from "@/components/tai-khoan/order-summary"
import { ArrowLeft } from "lucide-react"

interface OrderDetailPageProps {
  params: {
    id: string
  }
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  // Dữ liệu mẫu
  const order = {
    id: Number.parseInt(params.id),
    order_date: "2023-06-15T08:30:00Z",
    status: "Delivered",
    payment_status: "Paid",
    payment_method: "Momo",
    tracking_number: "VN123456789",
    total_amount: 1250000,
    subtotal_amount: 1300000,
    discount_amount: 50000,
    shipping_fee: 30000,
    shipping_method: "Giao hàng nhanh",
    estimated_delivery: "18/06/2023 - 20/06/2023",
    shipping_address: {
      recipient_name: "Nguyễn Văn A",
      recipient_phone: "0912345678",
      province_city: "Hồ Chí Minh",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
      street_address: "123 Lê Lợi",
    },
    items: [
      {
        id: 1,
        product_name: "Dior Sauvage EDP",
        variant: "100ml",
        quantity: 1,
        price: 850000,
        image: "/placeholder.svg?height=80&width=80",
        product_id: 101,
        is_in_stock: true,
      },
      {
        id: 2,
        product_name: "Chanel Bleu de Chanel EDP",
        variant: "50ml",
        quantity: 1,
        price: 450000,
        image: "/placeholder.svg?height=80&width=80",
        product_id: 102,
        is_in_stock: false,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Đơn hàng #{order.id}</h2>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">Đặt ngày {new Date(order.order_date).toLocaleDateString("vi-VN")}</p>
            <OrderStatus status={order.status} />
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/tai-khoan/don-hang">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Link>
        </Button>
      </div>
      <Separator />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <OrderItems items={order.items} />
        </div>
        <div>
          <OrderSummary order={order} />
        </div>
      </div>
    </div>
  )
}

