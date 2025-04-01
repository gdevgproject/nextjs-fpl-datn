import type { Metadata } from "next"
import { WishlistClient } from "./wishlist-client"

export const metadata: Metadata = {
  title: "Danh sách yêu thích | MyBeauty",
  description: "Quản lý danh sách sản phẩm yêu thích của bạn tại MyBeauty",
}

export default function WishlistPage() {
  return <WishlistClient />
}

