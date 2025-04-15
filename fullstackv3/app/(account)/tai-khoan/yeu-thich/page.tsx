import type { Metadata } from "next";
import { WishlistPage } from "@/features/shop/wishlist/components/wishlist-page";

export const metadata: Metadata = {
  title: "Sản phẩm yêu thích - MyBeauty",
  description: "Quản lý danh sách sản phẩm yêu thích của bạn",
};

export default function Page() {
  return <WishlistPage />;
}
