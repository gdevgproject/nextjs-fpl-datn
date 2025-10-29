// File: app/layout.tsx

import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react"; // <-- IMPORT THÊM SUSPENSE
import "./globals.css";
import { Providers } from "@/lib/providers/providers";
import { AuthToastHandler } from "@/components/auth-toast-handler";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "MyBeauty - Nước hoa chính hãng",
  description: "Cửa hàng nước hoa chính hãng với đa dạng thương hiệu cao cấp",
  generator: "v0.dev",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {/* 
            Bọc AuthToastHandler trong Suspense.
            - AuthToastHandler sử dụng useSearchParams, là một Client-side hook động.
            - Trang 404 (not-found.tsx) cần được render tĩnh tại thời điểm build.
            - Bọc trong Suspense báo cho Next.js: "Hãy render tĩnh phần còn lại,
              còn phần này sẽ được xử lý ở client sau".
            - fallback={null} vì chúng ta không cần hiển thị gì trong lúc chờ.
          */}
          <Suspense fallback={null}>
            <AuthToastHandler>{children}</AuthToastHandler>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
