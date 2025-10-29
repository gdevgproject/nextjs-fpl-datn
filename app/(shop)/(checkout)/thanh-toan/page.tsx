import type { Metadata } from "next";
import { CheckoutPage } from "@/features/shop/checkout/components/checkout-page";

export const metadata: Metadata = {
  title: "Thanh toán | MyBeauty",
  description: "Thanh toán đơn hàng của bạn tại MyBeauty",
};

export default function Page() {
  return <CheckoutPage />;
}
