import type React from "react";
import { AdminLayout } from "@/features/admin/shared/components/admin-layout";

export default function OrdersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminLayout>{children}</AdminLayout>;
}
