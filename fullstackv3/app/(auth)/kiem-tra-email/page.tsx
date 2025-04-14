import type { Metadata } from "next";
import { CheckEmailPage } from "@/features/shop/auth/components/check-email-page";

export const metadata: Metadata = {
  title: "Kiểm tra email - MyBeauty",
  description: "Vui lòng kiểm tra email của bạn",
};

export default function Page() {
  return <CheckEmailPage />;
}
