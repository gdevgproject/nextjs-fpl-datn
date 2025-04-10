import type { Metadata } from "next";
import OrdersTable from "@/features/admin/order-management/components/orders-table";

export const metadata: Metadata = {
  title: "Quản lý đơn hàng - Admin",
  description: "Quản lý tất cả đơn hàng trong hệ thống",
};

export default function OrdersPage() {
  return (
    <div className="container py-6">
      <OrdersTable />
    </div>
  );
}
