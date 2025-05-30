import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
          <AuthToastHandler>{children}</AuthToastHandler>
        </Providers>
      </body>
    </html>
  );
}
