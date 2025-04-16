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
        {/* Desktop: Hiện chữ Đăng nhập/Đăng ký */}
        <div className="gap-2 hidden md:flex">
          <Link href="/dang-nhap">
            <Button variant="ghost" className="font-semibold px-4">
              Đăng nhập
            </Button>
          </Link>
          <Link href="/dang-ky">
            <Button variant="outline" className="font-semibold px-4">
              Đăng ký
            </Button>
          </Link>
        </div>
        {/* Mobile: Chỉ hiện nút đăng nhập, không cần đăng ký */}
        <div className="flex gap-2 md:hidden">
          <Link href="/dang-nhap">
            <Button variant="ghost" size="icon">
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
          className="relative h-8 w-8 rounded-[10px] p-0 border border-border focus-visible:ring-2 focus-visible:ring-primary/70"
        >
          <Avatar className="h-8 w-8 rounded-[8px]">
            <AvatarImage
              src={avatarUrl}
              alt={displayName}
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = DEFAULT_AVATAR_URL;
              }}
            />
            <AvatarFallback>
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-72 p-0 overflow-hidden rounded-[12px] shadow-xl border border-border bg-background"
        align="end"
        forceMount
      >
        <div className="px-4 py-3 bg-muted/60 flex items-center gap-3 border-b border-border">
          <Avatar className="h-10 w-10 rounded-[8px]">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
            <p className="text-xs text-muted-foreground capitalize truncate">
              {userRoleDisplay}
            </p>
          </div>
        </div>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link
              href="/tai-khoan"
              className="flex items-center gap-2 rounded-[8px]"
            >
              <User className="w-4 h-4" />
              <span>Tài khoản</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/tai-khoan/don-hang"
              className="flex items-center gap-2 rounded-[8px]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Đơn hàng</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/tai-khoan/yeu-thich"
              className="flex items-center gap-2 rounded-[8px]"
            >
              <Heart className="w-4 h-4" />
              <span>Yêu thích</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {(role === "admin" || role === "staff" || role === "shipper") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/admin"
                className="flex items-center gap-2 rounded-[8px]"
              >
                <Settings className="w-4 h-4" />
                <span>Quản trị</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={logoutMutation.isPending}
          className="text-destructive flex items-center gap-2 rounded-[8px]"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>
            {logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
