"use client";

import { memo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/providers/auth-context";
import { DEFAULT_AVATAR_URL } from "@/lib/constants";
import {
  User,
  LogOut,
  Settings,
  Package,
  Heart,
  LayoutDashboard,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";

export const UserNav = memo(function UserNav() {
  const {
    user,
    profile,
    signOut,
    isAuthenticated,
    isLoading,
    profileImageUrl,
    role,
    refreshProfile,
  } = useAuth();
  const queryClient = useQueryClient();

  // Enhanced: Force refresh profile data on component mount
  useEffect(() => {
    if (user?.id && isAuthenticated) {
      // Silent background refresh on component mount
      refreshProfile(false).catch(console.error);
    }
  }, [user?.id, isAuthenticated, refreshProfile]);

  // Optimized sign out handler with useCallback
  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  // Enhanced: Improved dropdown open handler with immediate refresh
  const handleDropdownOpen = useCallback(() => {
    if (user?.id) {
      // Force an immediate refresh when dropdown opens
      refreshProfile(true).catch(console.error);
    }
  }, [refreshProfile, user?.id]);

  if (!isAuthenticated) {
    return (
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dang-nhap">Đăng nhập</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={handleDropdownOpen}>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full overflow-hidden"
          aria-label="User menu"
        >
          {isLoading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : (
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={profileImageUrl}
                alt={profile?.display_name || "Avatar"}
                className="object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = DEFAULT_AVATAR_URL;
                }}
              />
              <AvatarFallback>
                {profile?.display_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.display_name || "Người dùng"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* Admin and staff menu access */}
          {(role === "admin" || role === "staff") && (
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Trang quản trị</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/tai-khoan">
              <User className="mr-2 h-4 w-4" />
              <span>Tài khoản</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tai-khoan/don-hang">
              <Package className="mr-2 h-4 w-4" />
              <span>Đơn hàng</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tai-khoan/yeu-thich">
              <Heart className="mr-2 h-4 w-4" />
              <span>Yêu thích</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tai-khoan/cai-dat">
              <Settings className="mr-2 h-4 w-4" />
              <span>Cài đặt</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
