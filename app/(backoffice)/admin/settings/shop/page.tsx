import type { Metadata } from "next";
import { ShopSettingsForm } from "@/features/admin/shop/components/shop-settings-form";
import { AdminLayout } from "@/features/admin/shared/components/admin-layout";

export const metadata: Metadata = {
  title: "Cài đặt cửa hàng",
  description: "Quản lý thông tin và cài đặt cửa hàng",
};

export default function ShopSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cài đặt cửa hàng</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý thông tin, liên kết mạng xã hội và chính sách của cửa hàng.
          </p>
        </div>
        
        <ShopSettingsForm />
      </div>
    </AdminLayout>
  );
}
