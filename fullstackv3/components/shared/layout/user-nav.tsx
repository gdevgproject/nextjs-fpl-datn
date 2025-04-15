"use client";

import { memo } from "react";
import Link from "next/link";
import {  LogIn,
  LogOut,
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

export const UserNav = memo(function UserNav({ settings }: { settings?: any }) {
  const { data: session } = useAuthQuery();
  const isAuthenticated = !!session?.user;
  const { data: profile } = useProfileQuery(session?.user?.id);
  const logoutMutation = useLogoutMutation();
  const queryClient = useQueryClient();
  const { toast } = useSonnerToast();

  const handleSignOut = async () => {
    try {
      // Đăng xuất Supabase (mutation, chờ promise)
      await logoutMutation.mutateAsync();

      // Dọn sạch cache TanStack Query
      await queryClient.clear();

      // Dọn sạch localStorage liên quan
      localStorage.removeItem("guestCart");
      localStorage.removeItem("mybeauty_cart");
      localStorage.removeItem("wishlist");
      // Xóa thêm các key khác nếu có...

      // Xóa session cookie Supabase nếu có (tùy setup, ví dụ):
      document.cookie = "sb-access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "sb-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Hiển thị Sonner toast thành công
      toast.success("Đăng xuất thành công", {
        description: "Bạn đã đăng xuất khỏi tài khoản.",
      });
    } catch (error) {
      toast.error("Đăng xuất thất bại", {
        description: "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.",
      });
    }
  };

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

  const avatarUrl = profile?.avatar_url || DEFAULT_AVATAR_URL;
  const displayName = profile?.display_name || "Người dùng";
  const phone = profile?.phone_number || "";
  const email = session?.user?.email || "";
  const isAdmin = session?.user?.role === "admin" || session?.user?.role === "staff";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={avatarUrl}
              alt={displayName}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = DEFAULT_AVATAR_URL;
              }}
            />
            <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={avatarUrl}
                  alt={displayName}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = DEFAULT_AVATAR_URL;
                  }}
                />
                <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-base font-semibold leading-none line-clamp-1">{displayName}</p>
                {phone && <p className="text-xs text-muted-foreground line-clamp-1">{phone}</p>}
                {email && <p className="text-xs text-muted-foreground line-clamp-1">{email}</p>}
              </div>
            </div>
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
        {isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <span>Quản trị</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
