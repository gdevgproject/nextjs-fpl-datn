"use client";

import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { useShopSettings } from "@/features/shop/shared/hooks/use-shop-settings";
import { useMemo } from "react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  // Lấy shop settings (logo, tên) chỉ 1 lần, dùng useMemo để tránh render lại không cần thiết
  const { settings } = useShopSettings();
  const shopLogo = useMemo(
    () => settings?.shop_logo_url || "/placeholder-logo.svg",
    [settings]
  );
  const shopName = useMemo(() => settings?.shop_name || "MyBeauty", [settings]);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <img
            src={shopLogo}
            alt={shopName + " Logo"}
            width={120}
            height={40}
            className="h-10 w-auto rounded-md border border-border"
            loading="lazy"
            decoding="async"
          />
        </Link>
      </div>
      <div className="container flex-1 py-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {children}
        </div>
      </div>
      <div className="container py-4 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {shopName}. Tất cả quyền được bảo lưu.
        </p>
      </div>
    </div>
  );
}
