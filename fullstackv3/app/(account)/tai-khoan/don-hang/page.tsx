import type { Metadata } from "next";
import { OrderHistoryPage } from "@/features/shop/account/components/order-history-page";

export const metadata: Metadata = {
  title: "Lịch sử đơn hàng - MyBeauty",
  description: "Xem lịch sử đơn hàng của bạn tại MyBeauty",
};

export default function OrdersPage() {
  return <OrderHistoryPage />;
}
