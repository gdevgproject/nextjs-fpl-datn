"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
  BadgePercent,
  ImageIcon,
  ClipboardList,
  FileText,
  CreditCard,
  Store,
  AlertCircle,
} from "lucide-react"

interface AdminSidebarProps {
  onNavClick?: () => void
}

interface SidebarItemProps {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}

interface SidebarGroupProps {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function SidebarItem({ href, icon, label, active, onClick }: SidebarItemProps) {
  return (
    <Button
      asChild
      variant={active ? "secondary" : "ghost"}
      size="sm"
      className="w-full justify-start h-10 px-2"
      onClick={onClick}
    >
      <Link href={href}>
        {icon}
        <span className="ml-2 truncate">{label}</span>
      </Link>
    </Button>
  )
}

function SidebarGroup({ icon, label, children, defaultOpen = false }: SidebarGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start font-medium h-10 px-2"
        onClick={() => setIsOpen(!isOpen)}
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
  )
}

export function AdminSidebar({ onNavClick }: AdminSidebarProps) {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`)

  const handleClick = () => {
    if (onNavClick) onNavClick()
  }

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="p-4 flex items-center border-b">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Store className="h-5 w-5" />
          <span>MyBeauty Admin</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-2 md:px-3 py-2">
        <div className="space-y-2 py-2">
          <SidebarItem
            href="/admin"
            icon={<LayoutDashboard className="h-4 w-4" />}
            label="Tổng quan"
            active={isActive("/admin")}
            onClick={handleClick}
          />

          <Separator className="my-2" />

          {/* Catalog Management */}
          <SidebarGroup
            icon={<Package className="h-4 w-4" />}
            label="Quản lý sản phẩm"
            defaultOpen={pathname.includes("/admin/catalog")}
          >
            <SidebarItem
              href="/admin/catalog/products"
              icon={<Boxes className="h-4 w-4" />}
              label="Sản phẩm"
              active={isActive("/admin/catalog/products")}
              onClick={handleClick}
            />
            <SidebarItem
              href="/admin/catalog/categories"
              icon={<Layers className="h-4 w-4" />}
              label="Danh mục"
              active={isActive("/admin/catalog/categories")}
              onClick={handleClick}
            />
            <SidebarItem
              href="/admin/catalog/inventory"
              icon={<ClipboardList className="h-4 w-4" />}
              label="Kho hàng"
              active={isActive("/admin/catalog/inventory")}
              onClick={handleClick}
            />
            <SidebarItem
              href="/admin/catalog/labels"
              icon={<Tags className="h-4 w-4" />}
              label="Nhãn sản phẩm"
              active={isActive("/admin/catalog/labels")}
              onClick={handleClick}
            />

            <SidebarGroup
              icon={<Palette className="h-4 w-4" />}
              label="Thuộc tính"
              defaultOpen={pathname.includes("/admin/catalog/attributes")}
            >
              <SidebarItem
                href="/admin/catalog/attributes/brands"
                icon={<Store className="h-4 w-4" />}
                label="Thương hiệu"
                active={isActive("/admin/catalog/attributes/brands")}
                onClick={handleClick}
              />
              <SidebarItem
                href="/admin/catalog/attributes/concentrations"
                icon={<AlertCircle className="h-4 w-4" />}
                label="Nồng độ"
                active={isActive("/admin/catalog/attributes/concentrations")}
                onClick={handleClick}
              />
              <SidebarItem
                href="/admin/catalog/attributes/genders"
                icon={<Users className="h-4 w-4" />}
                label="Giới tính"
                active={isActive("/admin/catalog/attributes/genders")}
                onClick={handleClick}
              />
              <SidebarItem
                href="/admin/catalog/attributes/ingredients"
                icon={<FileText className="h-4 w-4" />}
                label="Thành phần"
                active={isActive("/admin/catalog/attributes/ingredients")}
                onClick={handleClick}
              />
              <SidebarItem
                href="/admin/catalog/attributes/perfume-types"
                icon={<Package className="h-4 w-4" />}
                label="Loại nước hoa"
                active={isActive("/admin/catalog/attributes/perfume-types")}
                onClick={handleClick}
              />
              <SidebarItem
                href="/admin/catalog/attributes/scents"
                icon={<Palette className="h-4 w-4" />}
                label="Nhóm hương"
                active={isActive("/admin/catalog/attributes/scents")}
                onClick={handleClick}
              />
            </SidebarGroup>
          </SidebarGroup>

          {/* Orders */}
          <SidebarItem
            href="/admin/orders"
            icon={<ShoppingBag className="h-4 w-4" />}
            label="Đơn hàng"
            active={isActive("/admin/orders")}
            onClick={handleClick}
          />

          {/* Users */}
          <SidebarItem
            href="/admin/users"
            icon={<Users className="h-4 w-4" />}
            label="Người dùng"
            active={isActive("/admin/users")}
            onClick={handleClick}
          />

          {/* Marketing */}
          <SidebarGroup
            icon={<BadgePercent className="h-4 w-4" />}
            label="Marketing"
            defaultOpen={pathname.includes("/admin/marketing")}
          >
            <SidebarItem
              href="/admin/marketing/banners"
              icon={<ImageIcon className="h-4 w-4" />}
              label="Banner"
              active={isActive("/admin/marketing/banners")}
              onClick={handleClick}
            />
            <SidebarItem
              href="/admin/discounts"
              icon={<BadgePercent className="h-4 w-4" />}
              label="Mã giảm giá"
              active={isActive("/admin/discounts")}
              onClick={handleClick}
            />
          </SidebarGroup>

          {/* Settings */}
          <SidebarGroup
            icon={<Settings className="h-4 w-4" />}
            label="Cài đặt"
            defaultOpen={pathname.includes("/admin/settings")}
          >
            <SidebarItem
              href="/admin/settings/shop"
              icon={<Store className="h-4 w-4" />}
              label="Cửa hàng"
              active={isActive("/admin/settings/shop")}
              onClick={handleClick}
            />
            <SidebarItem
              href="/admin/settings/payment-methods"
              icon={<CreditCard className="h-4 w-4" />}
              label="Phương thức thanh toán"
              active={isActive("/admin/settings/payment-methods")}
              onClick={handleClick}
            />
            <SidebarItem
              href="/admin/settings/statuses"
              icon={<ClipboardList className="h-4 w-4" />}
              label="Trạng thái đơn hàng"
              active={isActive("/admin/settings/statuses")}
              onClick={handleClick}
            />
            <SidebarItem
              href="/admin/settings/logs"
              icon={<FileText className="h-4 w-4" />}
              label="Nhật ký hoạt động"
              active={isActive("/admin/settings/logs")}
              onClick={handleClick}
            />
          </SidebarGroup>
        </div>
      </ScrollArea>
    </div>
  )
}
