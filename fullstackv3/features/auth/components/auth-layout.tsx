import type React from "react";
import Link from "next/link";
import Image from "next/image";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/logo.png"
            alt="MyBeauty Logo"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
        </Link>
      </div>
      <div className="container flex-1 py-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {children}
        </div>
      </div>
      <div className="container py-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} MyBeauty. Tất cả quyền được bảo lưu.</p>
      </div>
    </div>
  );
}
