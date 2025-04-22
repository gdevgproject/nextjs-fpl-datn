import type { Metadata } from "next";
import { UsersPage } from "@/features/admin/users/components/users-page";
import { AdminLayout } from "@/features/admin/shared/components/admin-layout";

export const metadata: Metadata = {
  title: "Quản lý người dùng | MyBeauty Admin",
  description: "Quản lý người dùng trong hệ thống MyBeauty",
};

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <UsersPage />
    </AdminLayout>
  );
}
