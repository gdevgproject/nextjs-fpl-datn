"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface AccountSidebarProps {
  user: User;
}

const menuItems = [
  {
    href: "/account/dashboard",
    label: "Tổng quan",
  },
  {
    href: "/account/orders",
    label: "Đơn hàng của tôi",
  },
  {
    href: "/account/profile",
    label: "Thông tin cá nhân",
  },
  {
    href: "/account/addresses",
    label: "Sổ địa chỉ",
  },
  {
    href: "/account/favorites",
    label: "Sản phẩm yêu thích",
  },
  {
    href: "/account/change-password",
    label: "Đổi mật khẩu",
  },
];

export function AccountSidebar({ user }: AccountSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="lg:col-span-1">
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto relative mb-4">
            <Image
              src="/avatar-placeholder.png"
              alt="Avatar"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-600 text-sm">{user.email}</p>
        </div>
        <nav className="mt-6 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block w-full p-3 rounded-md transition-colors",
                pathname === item.href
                  ? "bg-red-50 text-red-600 font-medium"
                  : "hover:bg-gray-50"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
