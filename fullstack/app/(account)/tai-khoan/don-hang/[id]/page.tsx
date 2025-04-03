import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Chi tiết đơn hàng - MyBeauty",
  description: "Xem chi tiết đơn hàng của bạn tại MyBeauty",
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return <OrderDetailPage orderId={Number.parseInt(params.id)} />
}

