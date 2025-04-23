import { Metadata } from "next";
import { OrderManagement } from "@/features/admin/orders/components/order-management";

export const metadata: Metadata = {
  title: "Quản lý đơn hàng",
  description: "Quản lý đơn hàng trong hệ thống",
};

export default function AdminOrdersPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý đơn hàng</h1>
        <p className="text-muted-foreground">
          Xem và quản lý tất cả các đơn hàng trong hệ thống
        </p>
      </div>

      <OrderManagement />
    </div>
  );
}
