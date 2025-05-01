import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | MyBeauty",
  description: "Quản lý cửa hàng MyBeauty",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
