import type { Metadata } from "next";
import { AddressPage } from "@/features/shop/account/components/address-page";

export const metadata: Metadata = {
  title: "Địa chỉ giao hàng - MyBeauty",
  description: "Quản lý địa chỉ giao hàng của bạn",
};

export default function Page() {
  return <AddressPage />;
}
