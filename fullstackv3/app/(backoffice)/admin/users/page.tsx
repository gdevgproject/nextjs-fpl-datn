import type { Metadata } from "next";
import { UserManagement } from "@/features/admin/users/components/user-management";
import { AdminLayout } from "@/features/admin/shared/admin-layout";

export const metadata: Metadata = {
  title: "Quản lý người dùng | MyBeauty Admin",
  description: "Quản lý người dùng trong hệ thống MyBeauty",
};

export default function UsersPage() {
  return (
    <AdminLayout>
      <UserManagement />
    </AdminLayout>
  );
}
