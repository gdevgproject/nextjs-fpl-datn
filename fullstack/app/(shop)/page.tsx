import { HomePage } from "@/features/home/components/home-page";
import { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE_NAME} - Nước hoa chính hãng | Cửa hàng nước hoa cao cấp`,
  description: SITE_DESCRIPTION,
};

export default function ShopHomePage() {
  return <HomePage />;
}
