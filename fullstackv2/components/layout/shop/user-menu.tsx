"use client";

import { useState, memo } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  ShoppingBag,
  Heart,
  MapPin,
  Package,
  Truck,
  LayoutDashboard,
  Users,
  Settings,
  UserCircle,
} from "lucide-react";
import { logOut } from "@/features/auth/actions";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get user role from metadata
  const userRole = user?.app_metadata?.role || "authenticated";

  // Get user display name from metadata
  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user.email?.split("@")[0];

  // Get user phone from metadata
  const userPhone =
    user?.user_metadata?.phone || user?.user_metadata?.phone_number || null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logOut();
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Đăng xuất thành công");
    } catch (error) {
      toast.error("Đăng xuất thất bại");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 focus:outline-none">
          <Avatar className="h-8 w-8">
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
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {userPhone && (
              <p className="text-xs leading-none text-muted-foreground">
                {userPhone}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/tai-khoan/thong-tin">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Thông tin tài khoản</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tai-khoan/don-hang">
              <ShoppingBag className="mr-2 h-4 w-4" />
              <span>Đơn hàng của tôi</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tai-khoan/yeu-thich">
              <Heart className="mr-2 h-4 w-4" />
              <span>Danh sách yêu thích</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tai-khoan/dia-chi">
              <MapPin className="mr-2 h-4 w-4" />
              <span>Địa chỉ của tôi</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {/* Role-specific menu items */}
        {(userRole === "admin" || userRole === "staff") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Quản lý</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/products">
                  <Package className="mr-2 h-4 w-4" />
                  <span>Sản phẩm</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/orders">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  <span>Đơn hàng</span>
                </Link>
              </DropdownMenuItem>
              {userRole === "admin" && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Người dùng</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Cài đặt</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuGroup>
          </>
        )}

        {userRole === "shipper" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Giao hàng</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/shipper/orders">
                  <Truck className="mr-2 h-4 w-4" />
                  <span>Đơn hàng cần giao</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/shipper/history">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  <span>Lịch sử giao hàng</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// At the end of the file, export the memoized UserMenu
export default memo(UserMenu);
