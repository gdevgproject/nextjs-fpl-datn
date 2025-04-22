import type React from "react";
import type { Metadata } from "next";
import { Providers } from "@/lib/providers/providers";

export const metadata: Metadata = {
  title: "Admin Dashboard | MyBeauty",
  description: "Quản lý cửa hàng MyBeauty",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Providers>{children}</Providers>;
}
