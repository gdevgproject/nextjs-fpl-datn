import type { Metadata } from "next";
import { UserDetailPage } from "@/features/admin/users/components/user-detail-page";
import { AdminLayout } from "@/features/admin/shared/components/admin-layout";

export const metadata: Metadata = {
  title: "Chi tiết người dùng | MyBeauty Admin",
  description: "Xem và quản lý thông tin chi tiết người dùng",
};

interface UserDetailPageProps {
  params: {
    userId: string;
  };
}

export default function AdminUserDetailPage({ params }: UserDetailPageProps) {
  return (
    <AdminLayout>
      <UserDetailPage userId={params.userId} />
    </AdminLayout>
  );
}
