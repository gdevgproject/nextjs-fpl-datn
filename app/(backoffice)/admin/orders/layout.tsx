import { AdminLayout } from "@/features/admin/shared/components/admin-layout";

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
