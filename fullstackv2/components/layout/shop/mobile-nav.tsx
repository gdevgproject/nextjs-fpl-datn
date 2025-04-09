"use client";

import { useState, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  UserIcon,
  LogOut,
  ShoppingBag,
  Heart,
  Settings,
  Package,
  Truck,
  LayoutDashboard,
  Users,
  MapPin,
  UserCircle,
} from "lucide-react";
import { logOut } from "@/features/auth/actions";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface MobileNavProps {
  user: User | null;
  navItems: { name: string; href: string }[];
  onNavClick: () => void;
}

export function MobileNav({ user, navItems, onNavClick }: MobileNavProps) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get user role from metadata
  const userRole = user?.app_metadata?.role || "authenticated";

  // Get user display name from metadata
  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0];

  // Get user phone from metadata
  const userPhone =
    user?.user_metadata?.phone || user?.user_metadata?.phone_number || null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logOut();
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Đăng xuất thành công");
      onNavClick(); // Close mobile menu after logout
    } catch (error) {
      toast.error("Đăng xuất thất bại");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 py-4">
        <Link href="/" onClick={onNavClick} className="flex items-center">
          <span className="text-xl font-bold">MyBeauty</span>
        </Link>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="px-6 py-4">
          {user ? (
            <div className="flex items-center gap-3 mb-6">
              <Avatar>
                <AvatarImage
                  src={user.user_metadata?.avatar_url}
                  alt={displayName || ""}
                />
                <AvatarFallback>
                  {displayName?.charAt(0).toUpperCase() ||
                    user.email?.charAt(0).toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{displayName}</span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
                {userPhone && (
                  <span className="text-xs text-muted-foreground">
                    {userPhone}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mb-6">
              <Button asChild>
                <Link href="/login" onClick={onNavClick}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Đăng nhập
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/register" onClick={onNavClick}>
                  Đăng ký
                </Link>
              </Button>
            </div>
          )}

          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/" onClick={onNavClick}>
                <Home className="mr-2 h-4 w-4" />
                Trang chủ
              </Link>
            </Button>

            {/* Main navigation items */}
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  pathname === item.href && "bg-accent text-accent-foreground"
                )}
                asChild
              >
                <Link href={item.href} onClick={onNavClick}>
                  {item.name}
                </Link>
              </Button>
            ))}

            <Separator className="my-4" />

            {/* User specific navigation */}
            {user && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/tai-khoan/thong-tin" onClick={onNavClick}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    Thông tin tài khoản
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/tai-khoan/don-hang" onClick={onNavClick}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Đơn hàng của tôi
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/tai-khoan/yeu-thich" onClick={onNavClick}>
                    <Heart className="mr-2 h-4 w-4" />
                    Danh sách yêu thích
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/tai-khoan/dia-chi" onClick={onNavClick}>
                    <MapPin className="mr-2 h-4 w-4" />
                    Địa chỉ của tôi
                  </Link>
                </Button>

                {/* Role-specific options */}
                {(userRole === "admin" || userRole === "staff") && (
                  <>
                    <Separator className="my-4" />
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Quản lý
                    </p>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/admin/dashboard" onClick={onNavClick}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/admin/products" onClick={onNavClick}>
                        <Package className="mr-2 h-4 w-4" />
                        Sản phẩm
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/admin/orders" onClick={onNavClick}>
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Đơn hàng
                      </Link>
                    </Button>
                    {userRole === "admin" && (
                      <>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          asChild
                        >
                          <Link href="/admin/users" onClick={onNavClick}>
                            <Users className="mr-2 h-4 w-4" />
                            Người dùng
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          asChild
                        >
                          <Link href="/admin/settings" onClick={onNavClick}>
                            <Settings className="mr-2 h-4 w-4" />
                            Cài đặt
                          </Link>
                        </Button>
                      </>
                    )}
                  </>
                )}

                {userRole === "shipper" && (
                  <>
                    <Separator className="my-4" />
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Giao hàng
                    </p>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/shipper/orders" onClick={onNavClick}>
                        <Truck className="mr-2 h-4 w-4" />
                        Đơn hàng cần giao
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/shipper/history" onClick={onNavClick}>
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Lịch sử giao hàng
                      </Link>
                    </Button>
                  </>
                )}

                <Separator className="my-4" />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                </Button>
              </>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default memo(MobileNav);
