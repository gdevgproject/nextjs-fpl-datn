"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserNav } from "@/features/shop/shared/components/user-nav";
import { useAuthQuery } from "@/features/auth/hooks";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  Package,
  Tags,
  Layers,
  Boxes,
  Palette,
  ImageIcon,
  ClipboardList,
  FileText,
  CreditCard,
  Store,
  AlertCircle,
  Menu,
  X,
  Receipt,
  BookOpen,
  LineChart,
} from "lucide-react";

interface AdminSidebarProps {
  onNavClick?: () => void;
  isMobile?: boolean;
}

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

interface SidebarGroupProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function SidebarItem({ href, icon, label, active, onClick }: SidebarItemProps) {
  // Lấy context từ Admin Sidebar
  const { data: session } = useAuthQuery();
  const userRole = session?.user?.app_metadata?.role || "authenticated";
  const isStaff = userRole === "staff";
  const isShipper = userRole === "shipper";
  const canAccess =
    userRole === "admin" ||
    (isStaff && href.startsWith("/admin/orders")) ||
    (isShipper && href.startsWith("/admin/orders"));

  return (
    <Button
      asChild={canAccess}
      variant={active ? "secondary" : "ghost"}
      size="sm"
      className="w-full justify-start h-10 px-3"
      onClick={onClick}
      disabled={!(isStaff || isShipper) ? false : !canAccess}
    >
      {canAccess ? (
        <Link href={href} className="relative">
          {icon}
          <span className="ml-2 truncate">{label}</span>
        </Link>
      ) : (
        <div className="relative">
          {icon}
          <span className="ml-2 truncate">{label}</span>
        </div>
      )}
    </Button>
  );
}

function SidebarGroup({
  icon,
  label,
  children,
  defaultOpen = false,
}: SidebarGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { data: session } = useAuthQuery();
  const userRole = session?.user?.app_metadata?.role || "authenticated";
  const isStaff = userRole === "staff";
  const isShipper = userRole === "shipper";

  // Staff và Shipper chỉ có thể mở menu "Đơn hàng"
  const canOpen = !(isStaff || isShipper) || label === "Đơn hàng";

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start font-medium h-10 px-3"
        onClick={() => canOpen && setIsOpen(!isOpen)}
        disabled={(isStaff || isShipper) && !canOpen}
      >
        {icon}
        <span className="ml-2 truncate">{label}</span>
        {isOpen ? (
          <ChevronDown className="ml-auto h-4 w-4 flex-shrink-0" />
        ) : (
          <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0" />
        )}
      </Button>
      {isOpen && <div className="pl-3 md:pl-4 space-y-1">{children}</div>}
    </div>
  );
}

export function AdminSidebar({
  onNavClick,
  isMobile = false,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const isActive = (path: string) =>
    pathname === path || pathname?.startsWith(`${path}/`);

  const handleClick = () => {
    if (onNavClick) onNavClick();
  };

  // Lấy thông tin session để hiển thị tên và quyền người dùng
  const { data: session } = useAuthQuery();
  // Kiểm tra role người dùng
  const userRole = session?.user?.app_metadata?.role || "authenticated";
  const isStaff = userRole === "staff";

  const SidebarHeader = () => (
    <div className="sticky top-0 z-20 flex items-center justify-between p-4 border-b bg-background backdrop-blur-sm">
      <Link
        href={isStaff ? "/admin/orders" : "/admin"}
        className="flex items-center gap-2 font-semibold"
      >
        <Store className="h-5 w-5 text-primary" />
        <span className="text-lg">MyBeauty Admin</span>
      </Link>

      {isMobile && (
        <Button variant="ghost" size="icon" onClick={onNavClick}>
          <X className="h-5 w-5" />
          <span className="sr-only">Đóng menu</span>
        </Button>
      )}
    </div>
  );

  const SidebarUserNav = () => (
    <div className="sticky bottom-0 z-20 mt-auto border-t bg-background/80 backdrop-blur-sm p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <UserNav />
          <div className="hidden sm:block flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {session?.user?.user_metadata?.display_name ||
                session?.user?.email?.split("@")[0] ||
                "Người dùng"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {session?.user?.app_metadata?.role === "admin"
                ? "Quản trị viên"
                : session?.user?.app_metadata?.role === "staff"
                ? "Nhân viên"
                : "Người dùng"}
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="flex h-full w-full flex-col bg-background">
      <SidebarHeader />

      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-2 py-2">
          <SidebarItem
            href="/admin"
            icon={<LayoutDashboard className="h-4 w-4 text-emerald-500" />}
            label="Tổng quan"
            active={isActive("/admin") && pathname === "/admin"}
            onClick={handleClick}
          />

          <Separator className="my-2" />

          {/* Catalog Management */}
          <SidebarGroup
            icon={<Package className="h-4 w-4 text-blue-500" />}
            label="Quản lý sản phẩm"
            defaultOpen={pathname.includes("/admin/catalog")}
          >
            <SidebarItem
              href="/admin/catalog/products"
              icon={<Boxes className="h-4 w-4 text-indigo-500" />}
              label="Sản phẩm"
              active={isActive("/admin/catalog/products")}
              onClick={handleClick}
            />
            <SidebarItem
              href="/admin/catalog/categories"
              icon={<Layers className="h-4 w-4 text-purple-500" />}
              label="Danh mục"
              active={isActive("/admin/catalog/categories")}
              onClick={handleClick}
            />
            <SidebarItem
              href="/admin/catalog/labels"
              icon={<Tags className="h-4 w-4 text-pink-500" />}
              label="Nhãn sản phẩm"
              active={isActive("/admin/catalog/labels")}
              onClick={handleClick}
            />

            <SidebarGroup
              icon={<Palette className="h-4 w-4 text-amber-500" />}
              label="Thuộc tính"
              defaultOpen={pathname.includes("/admin/catalog/attributes")}
            >
              <SidebarItem
                href="/admin/catalog/attributes/brands"
                icon={<Store className="h-4 w-4 text-orange-500" />}
                label="Thương hiệu"
                active={isActive("/admin/catalog/attributes/brands")}
                onClick={handleClick}
              />
              <SidebarItem
                href="/admin/catalog/attributes/concentrations"
                icon={<AlertCircle className="h-4 w-4 text-rose-500" />}
                label="Nồng độ"
                active={isActive("/admin/catalog/attributes/concentrations")}
                onClick={handleClick}
              />
              <SidebarItem
                href="/admin/catalog/attributes/genders"
                icon={<Users className="h-4 w-4 text-sky-500" />}
                label="Giới tính"
                active={isActive("/admin/catalog/attributes/genders")}
                onClick={handleClick}
              />
              <SidebarItem
                href="/admin/catalog/attributes/ingredients"
                icon={<FileText className="h-4 w-4 text-lime-500" />}
                label="Thành phần"
                active={isActive("/admin/catalog/attributes/ingredients")}
                onClick={handleClick}
              />
              <SidebarItem
                href="/admin/catalog/attributes/perfume-types"
                icon={<Package className="h-4 w-4 text-cyan-500" />}
                label="Loại nước hoa"
                active={isActive("/admin/catalog/attributes/perfume-types")}
                onClick={handleClick}
              />
              <SidebarItem
                href="/admin/catalog/attributes/scents"
                icon={<Palette className="h-4 w-4 text-fuchsia-500" />}
                label="Nhóm hương"
                active={isActive("/admin/catalog/attributes/scents")}
                onClick={handleClick}
              />
            </SidebarGroup>
          </SidebarGroup>

          {/* Orders */}
          <SidebarItem
            href="/admin/orders"
            icon={<Receipt className="h-4 w-4 text-amber-600" />}
            label="Đơn hàng"
            active={isActive("/admin/orders")}
            onClick={handleClick}
          />

          {/* Users */}
          <SidebarItem
            href="/admin/users"
            icon={<Users className="h-4 w-4 text-green-500" />}
            label="Người dùng"
            active={isActive("/admin/users")}
            onClick={handleClick}
          />

          {/* Marketing */}
          <SidebarGroup
            icon={<LineChart className="h-4 w-4 text-teal-500" />}
            label="Marketing"
            defaultOpen={pathname.includes("/admin/marketing")}
          >
            <SidebarItem
              href="/admin/marketing/banners"
              icon={<ImageIcon className="h-4 w-4 text-violet-500" />}
              label="Banner"
              active={isActive("/admin/marketing/banners")}
              onClick={handleClick}
            />
            <SidebarItem
              href="/admin/discounts"
              icon={<ClipboardList className="h-4 w-4 text-yellow-600" />}
              label="Mã giảm giá"
              active={isActive("/admin/discounts")}
              onClick={handleClick}
            />
          </SidebarGroup>

          {/* Settings */}
          <SidebarGroup
            icon={<Settings className="h-4 w-4 text-gray-500" />}
            label="Cài đặt"
            defaultOpen={pathname.includes("/admin/settings")}
          >
            <SidebarItem
              href="/admin/settings/shop"
              icon={<Store className="h-4 w-4 text-indigo-400" />}
              label="Cửa hàng"
              active={isActive("/admin/settings/shop")}
              onClick={handleClick}
            />
            <SidebarItem
              href="/admin/settings/payment-methods"
              icon={<CreditCard className="h-4 w-4 text-emerald-400" />}
              label="Phương thức thanh toán"
              active={isActive("/admin/settings/payment-methods")}
              onClick={handleClick}
            />
            <SidebarItem
              href="/admin/settings/logs"
              icon={<BookOpen className="h-4 w-4 text-slate-500" />}
              label="Nhật ký hoạt động"
              active={isActive("/admin/settings/logs")}
              onClick={handleClick}
            />
          </SidebarGroup>
        </div>
      </ScrollArea>

      <SidebarUserNav />
    </div>
  );

  return sidebarContent;
}

// Mobile admin sidebar with trigger button
export function MobileAdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open admin menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px] sm:w-[350px]">
          {/* SheetTitle must be the first direct child */}
          <SheetTitle asChild>
            <span className="sr-only">Admin menu</span>
          </SheetTitle>
          {/* Do not wrap SheetTitle in a fragment or any other element */}
          <AdminSidebar onNavClick={() => setOpen(false)} isMobile={true} />
        </SheetContent>
      </Sheet>
    </>
  );
}
