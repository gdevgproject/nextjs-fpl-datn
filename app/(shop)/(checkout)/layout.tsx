"use client";

import { CheckoutProvider } from "@/features/shop/checkout/checkout-provider";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // CheckoutProvider giờ đây chỉ bao bọc các trang liên quan đến thanh toán.
  // Điều này cô lập hook useSearchParams và giải quyết lỗi build.
  return <CheckoutProvider>{children}</CheckoutProvider>;
}
