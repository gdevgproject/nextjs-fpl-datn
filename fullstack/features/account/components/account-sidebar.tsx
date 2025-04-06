"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  Heart,
  LogOut,
  Package,
  Settings,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/providers/auth-context";
import { logout } from "@/features/auth/actions";
import { useMemo } from "react";

const accountNavItems = [
  { title: "Thông tin tài khoản", href: "/tai-khoan", icon: User },
  { title: "Đơn hàng của tôi", href: "/tai-khoan/don-hang", icon: Package },
  { title: "Sản phẩm yêu thích", href: "/tai-khoan/yeu-thich", icon: Heart },
  { title: "Địa chỉ giao hàng", href: "/tai-khoan/dia-chi", icon: CreditCard },
  { title: "Cài đặt tài khoản", href: "/tai-khoan/cai-dat", icon: Settings },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const { profile, profileImageUrl } = useAuth();

  // Memoize the navigation items to prevent unnecessary re-renders
  const navigationItems = useMemo(() => {
    return accountNavItems.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${
          pathname === item.href ? "bg-muted" : ""
        }`}
      >
        <item.icon className="h-4 w-4" />
        {item.title}
      </Link>
    ));
  }, [pathname]);

  return (
    <div className="w-full md:w-64">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center">
          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-muted">
            {/* Use optimized image loading */}
            <img
              src={profileImageUrl}
              alt={profile?.display_name || "Avatar"}
              className="h-full w-full object-cover"
              loading="eager"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = "/images/default-avatar.png";
              }}
            />
          </div>
          <div>
            <h2 className="text-lg font-medium">
              {profile?.display_name || "Người dùng"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {profile?.phone_number || ""}
            </p>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {navigationItems}
          <form action={logout}>
            <Button
              variant="ghost"
              className="w-full justify-start px-3"
              type="submit"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Đăng xuất
            </Button>
          </form>
        </nav>
      </div>
    </div>
  );
}
