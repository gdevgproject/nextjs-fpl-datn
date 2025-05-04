"use client";

import { memo, useCallback } from "react";
import Link from "next/link";
import {
  LogIn,
  LogOut,
  User,
  ShoppingBag,
  Heart,
  Settings,
  MapPin,
  Users as UserGroup,
  Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { DEFAULT_AVATAR_URL } from "@/lib/constants";
import {
  useAuthQuery,
  useProfileQuery,
  useLogoutMutation,
} from "@/features/auth/hooks";
import type { ShopSettings } from "@/lib/types/shared.types";

interface UserNavProps {
  settings?: ShopSettings;
}

/**
 * User navigation component that displays different UI based on authentication state
 * Optimized with React.memo and useCallback for better performance
 */
export const UserNav = memo(function UserNav({ settings }: UserNavProps) {
  const { data: session, isLoading: isAuthLoading } = useAuthQuery();
  const isAuthenticated = !!session?.user;

  // Only fetch profile if user is authenticated
  const { data: profile, isLoading: isProfileLoading } = useProfileQuery(
    isAuthenticated ? session?.user?.id : undefined
  );

  const logoutMutation = useLogoutMutation();
  const queryClient = useQueryClient();
  const { success, error } = useSonnerToast();

  // Optimized logout handler with useCallback
  const handleSignOut = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();

      // Clear all queries to prevent stale data when logging back in
      await queryClient.clear();

      // Clear local storage items related to the user
      localStorage.removeItem("guestCart");
      localStorage.removeItem("mybeauty_cart");
      localStorage.removeItem("wishlist");

      // Clear cookies (though Supabase handles this, we do it for extra safety)
      document.cookie =
        "sb-access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "sb-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      success("Đăng xuất thành công", {
        description: "Bạn đã đăng xuất khỏi tài khoản.",
      });
    } catch (err) {
      error("Đăng xuất thất bại", {
        description: "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.",
      });
    }
  }, [logoutMutation, queryClient, success, error]);

  // Show login/register if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        {/* Desktop: login/register buttons with hover effects */}
        <div className="gap-2 hidden md:flex">
          <Link href="/dang-nhap">
            <Button
              variant="ghost"
              className="font-medium px-4 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
            >
              Đăng nhập
            </Button>
          </Link>
          <Link href="/dang-ky">
            <Button
              variant="outline"
              className="font-medium px-4 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:border-primary"
            >
              Đăng ký
            </Button>
          </Link>
        </div>
        {/* Mobile: Only show login button */}
        <div className="flex gap-2 md:hidden">
          <Link href="/dang-nhap">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 dark:hover:bg-primary/20"
            >
              <LogIn className="h-5 w-5" />
              <span className="sr-only">Đăng nhập</span>
            </Button>
          </Link>
        </div>
      </>
    );
  }

  const role =
    session?.user?.app_metadata?.role || session?.user?.role || "user";

  // Get user info with fallbacks for better UX
  const avatarUrl =
    !isProfileLoading && profile?.avatar_url
      ? profile.avatar_url
      : DEFAULT_AVATAR_URL;

  const displayName =
    !isProfileLoading && profile?.display_name
      ? profile.display_name
      : session?.user?.email?.split("@")[0] || "Người dùng";

  const phone =
    !isProfileLoading && profile?.phone_number ? profile.phone_number : "";

  const email = session?.user?.email || "";

  const userRoleDisplay =
    role === "admin"
      ? "Quản trị viên"
      : role === "staff"
      ? "Nhân viên"
      : role === "shipper"
      ? "Nhân viên giao hàng"
      : "Khách hàng";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative group h-8 w-8 rounded-full p-0 overflow-visible focus-visible:ring-2 focus-visible:ring-primary/70"
        >
          {/* Decorative ring effect */}
          <span className="absolute inset-0 rounded-full border border-primary/30 group-hover:border-primary/50 transition-all duration-300" />
          <span className="absolute inset-[-2px] rounded-full bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 dark:from-primary/30 dark:via-primary/10 dark:to-primary/30 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />

          {/* Status indicator dot - only shown for authenticated users */}
          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 border border-background z-10" />

          <Avatar className="h-8 w-8 rounded-full shadow-sm ring-1 ring-primary/10 group-hover:ring-primary/30 transition-all duration-300">
            <AvatarImage
              src={avatarUrl}
              alt={displayName}
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = DEFAULT_AVATAR_URL;
              }}
              className="object-cover aspect-square h-full w-full transition-all duration-300 group-hover:scale-105"
            />
            <AvatarFallback className="bg-gradient-to-br from-primary/15 to-primary/5 text-primary font-medium">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-72 p-0 overflow-hidden rounded-xl shadow-lg border border-border/60 bg-background backdrop-blur-sm"
        align="end"
        forceMount
        sideOffset={8}
      >
        <div className="px-4 py-3.5 bg-muted/30 backdrop-blur-sm flex items-center gap-3 border-b border-border/40">
          <Avatar className="h-10 w-10 rounded-full ring-2 ring-background shadow-sm">
            <AvatarImage
              src={avatarUrl}
              alt={displayName}
              className="object-cover aspect-square h-full w-full"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base truncate text-foreground">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
            <p className="text-xs text-primary/70 capitalize truncate">
              {userRoleDisplay}
            </p>
          </div>
        </div>

        <div className="p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link
                href="/tai-khoan"
                className="flex cursor-pointer items-center gap-2.5 rounded-md py-2 px-3 hover:bg-muted transition-colors"
              >
                <User className="w-4 h-4 text-muted-foreground" />
                <span>Tài khoản</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/tai-khoan/don-hang"
                className="flex cursor-pointer items-center gap-2.5 rounded-md py-2 px-3 hover:bg-muted transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                <span>Đơn hàng</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/tai-khoan/yeu-thich"
                className="flex cursor-pointer items-center gap-2.5 rounded-md py-2 px-3 hover:bg-muted transition-colors"
              >
                <Heart className="w-4 h-4 text-muted-foreground" />
                <span>Yêu thích</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/tai-khoan/dia-chi"
                className="flex cursor-pointer items-center gap-2.5 rounded-md py-2 px-3 hover:bg-muted transition-colors"
              >
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>Địa chỉ</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </div>

        {role === "admin" && (
          <>
            <DropdownMenuSeparator className="mx-1.5" />
            <div className="p-1.5">
              <DropdownMenuLabel className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Quản trị
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link
                  href="/admin"
                  className="flex cursor-pointer items-center gap-2.5 rounded-md py-2 px-3 hover:bg-muted transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/admin/orders"
                  className="flex cursor-pointer items-center gap-2.5 rounded-md py-2 px-3 hover:bg-muted transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                  <span>Đơn hàng</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/admin/catalog/products"
                  className="flex cursor-pointer items-center gap-2.5 rounded-md py-2 px-3 hover:bg-muted transition-colors"
                >
                  <Boxes className="w-4 h-4 text-muted-foreground" />
                  <span>Sản phẩm</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/admin/users"
                  className="flex cursor-pointer items-center gap-2.5 rounded-md py-2 px-3 hover:bg-muted transition-colors"
                >
                  <UserGroup className="w-4 h-4 text-muted-foreground" />
                  <span>Người dùng</span>
                </Link>
              </DropdownMenuItem>
            </div>
          </>
        )}

        {role === "staff" && (
          <>
            <DropdownMenuSeparator className="mx-1.5" />
            <div className="p-1.5">
              <DropdownMenuLabel className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Nhân viên
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link
                  href="/admin/orders"
                  className="flex cursor-pointer items-center gap-2.5 rounded-md py-2 px-3 hover:bg-muted transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                  <span>Quản lý đơn hàng</span>
                </Link>
              </DropdownMenuItem>
            </div>
          </>
        )}

        {role === "shipper" && (
          <>
            <DropdownMenuSeparator className="mx-1.5" />
            <div className="p-1.5">
              <DropdownMenuLabel className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Giao hàng
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link
                  href="/shipper"
                  className="flex cursor-pointer items-center gap-2.5 rounded-md py-2 px-3 hover:bg-muted transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                  <span>Khu vực shipper</span>
                </Link>
              </DropdownMenuItem>
            </div>
          </>
        )}

        <DropdownMenuSeparator className="mx-1.5" />
        <div className="p-1.5">
          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={logoutMutation.isPending}
            className="flex cursor-pointer items-center gap-2.5 text-destructive rounded-md py-2 px-3 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>
              {logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất"}
            </span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
