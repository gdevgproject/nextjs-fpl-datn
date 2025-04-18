import { OrderManagement } from "@/features/admin/orders/components/order-management";
import { AdminLayout } from "@/features/admin/shared/admin-layout";

export const metadata = {
  title: "Quản lý đơn hàng | MyBeauty Admin",
  description: "Quản lý đơn hàng của cửa hàng MyBeauty",
};

export default function OrdersPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý đơn hàng
          </h1>
        </div>

        <OrderManagement />
      </div>
    </AdminLayout>
  );
}
