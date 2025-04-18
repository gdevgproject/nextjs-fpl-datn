import { AdminLayout } from "@/features/admin/shared/components/admin-layout";
import { InventoryManagement } from "@/features/admin/inventory/components/inventory-management";

export const metadata = {
  title: "Quản lý kho hàng | MyBeauty",
  description: "Quản lý tồn kho và lịch sử xuất nhập kho",
};

export default function InventoryPage() {
  return (
    <AdminLayout>
      <InventoryManagement />
    </AdminLayout>
  );
}
