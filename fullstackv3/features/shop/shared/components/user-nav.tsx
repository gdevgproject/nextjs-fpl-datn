"use client";

import { memo, useCallback } from "react";
import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
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
    session?.user?.id,
    { enabled: isAuthenticated }
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

  // Show login button if not authenticated
  if (!isAuthenticated) {
    return (
      <Link href="/dang-nhap">
        <Button variant="ghost" size="icon">
          <LogIn className="h-5 w-5" />
          <span className="sr-only">Đăng nhập</span>
        </Button>
      </Link>
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
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
          <Avatar className="h-8 w-8">
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
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-base font-semibold leading-none line-clamp-1">
              {displayName}
            </p>
            {phone && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {phone}
              </p>
            )}
            <p className="text-xs text-muted-foreground line-clamp-1 capitalize">
              {userRoleDisplay}
            </p>
            {email && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/tai-khoan">
              <span>Tài khoản</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tai-khoan/don-hang">
              <span>Đơn hàng</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tai-khoan/yeu-thich">
              <span>Yêu thích</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {(role === "admin" || role === "staff" || role === "shipper") && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <span>Quản trị</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={logoutMutation.isPending}
          className="text-destructive"
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
