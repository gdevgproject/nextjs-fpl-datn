import { DiscountManagement } from "@/features/admin/discounts/components/discount-management";
import { AdminLayout } from "@/features/admin/shared/admin-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý mã giảm giá | MyBeauty",
  description: "Quản lý mã giảm giá cho cửa hàng MyBeauty",
};

export default function DiscountsPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý mã giảm giá
          </h1>
          <p className="text-muted-foreground">
            Tạo và quản lý các mã giảm giá cho khách hàng của bạn.
          </p>
        </div>

        <DiscountManagement />
      </div>
    </AdminLayout>
  );
}
