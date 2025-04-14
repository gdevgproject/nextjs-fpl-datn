import type { Metadata } from "next"
import { CartPage } from "@/features/cart/components/cart-page"

export const metadata: Metadata = {
  title: "Giỏ hàng | MyBeauty",
  description: "Giỏ hàng của bạn tại MyBeauty",
}

export default function Page() {
  return <CartPage />
}

