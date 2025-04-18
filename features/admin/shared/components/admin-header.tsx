"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthQuery, useLogoutMutation } from "@/features/auth/hooks";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Bell,
  Menu,
  Search,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Store,
  Home,
  Phone,
  Shield,
  Mail,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AdminSidebar } from "./admin-sidebar";

export function AdminHeader() {
  // Lấy session từ TanStack Query
  const { data: session } = useAuthQuery();
  const user = session?.user;
  const logoutMutation = useLogoutMutation();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount] = useState(3); // Example notification count

  // Get user display name from metadata
  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0];
  // Get user role from metadata
  const userRole = user?.app_metadata?.role || "authenticated";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutMutation.mutateAsync();
      // Optionally: redirect after logout
      // window.location.href = "/"
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        {/* Mobile menu button */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="outline" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Mở menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            {/* Thêm DialogTitle để tránh lỗi accessibility */}
            <DialogTitle className="sr-only">Menu quản trị</DialogTitle>
            <AdminSidebar onNavClick={() => setIsMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/admin" className="mr-4 flex items-center space-x-2">
          <span className="hidden font-bold sm:inline-block">
            MyBeauty Admin
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-md relative hidden sm:flex">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm..."
              className="pl-8 w-full md:w-[300px] lg:w-[400px]"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-1">
          <ThemeToggle />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {notificationCount}
                  </Badge>
                )}
                <span className="sr-only">Thông báo</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-auto">
                <div className="p-2 hover:bg-muted rounded-md cursor-pointer">
                  <p className="text-sm font-medium">Đơn hàng mới #1234</p>
                  <p className="text-xs text-muted-foreground">2 phút trước</p>
                </div>
                <div className="p-2 hover:bg-muted rounded-md cursor-pointer">
                  <p className="text-sm font-medium">Sản phẩm sắp hết hàng</p>
                  <p className="text-xs text-muted-foreground">15 phút trước</p>
                </div>
                <div className="p-2 hover:bg-muted rounded-md cursor-pointer">
                  <p className="text-sm font-medium">Đánh giá mới cần duyệt</p>
                  <p className="text-xs text-muted-foreground">1 giờ trước</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/admin/notifications"
                  className="w-full cursor-pointer justify-center"
                >
                  Xem tất cả
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/settings/shop">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Cài đặt</span>
            </Link>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 pl-1">
                <Avatar className="h-7 w-7">
                  <AvatarImage
                    src={user?.user_metadata?.avatar_url}
                    alt={displayName || ""}
                  />
                  <AvatarFallback>
                    {displayName?.charAt(0).toUpperCase() ||
                      user?.email?.charAt(0).toUpperCase() ||
                      "A"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block text-sm font-medium truncate max-w-[100px] lg:max-w-[200px]">
                  {displayName}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {displayName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground flex items-center">
                    <Mail className="mr-1 h-3 w-3" />
                    <span>{user?.email}</span>
                  </p>
                  {user?.user_metadata?.phone_number && (
                    <p className="text-xs leading-none text-muted-foreground flex items-center">
                      <Phone className="mr-1 h-3 w-3" />
                      {user.user_metadata.phone_number}
                    </p>
                  )}
                  {userRole && (
                    <p className="text-xs leading-none text-muted-foreground flex items-center mt-1">
                      <Shield className="mr-1 h-3 w-3" />
                      <span className="capitalize">{userRole}</span>
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Hồ sơ</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings/shop">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Cài đặt</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Thêm nhóm chuyển đổi giữa Admin và Shop */}
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Chuyển đổi
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Store className="mr-2 h-4 w-4" />
                    <span>Đến trang cửa hàng</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Trang chủ Admin</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
