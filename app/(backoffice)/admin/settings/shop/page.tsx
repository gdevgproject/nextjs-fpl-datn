import type { Metadata } from "next";
import { AdminLayout } from "@/features/admin/shared/components/admin-layout";
import { ShopSettingsForm } from "@/features/admin/shop/components/shop-settings-form";

export const metadata: Metadata = {
  title: "Cài đặt cửa hàng | MyBeauty Admin",
  description: "Quản lý thông tin cửa hàng MyBeauty",
};

export default function ShopSettingsPage() {
  return (
    <AdminLayout
      title="Cài đặt cửa hàng"
      description="Quản lý thông tin và cấu hình cửa hàng"
    >
      <ShopSettingsForm />
    </AdminLayout>
  );
}
