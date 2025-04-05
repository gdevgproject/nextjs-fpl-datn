"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Box, Home, LayoutGrid, Package, Settings, ShoppingCart, Tag, Users } from "lucide-react"

const adminNavItems = [
  { title: "Tổng quan", href: "/admin", icon: Home },
  { title: "Đơn hàng", href: "/admin/don-hang", icon: ShoppingCart },
  { title: "Sản phẩm", href: "/admin/san-pham", icon: Package },
  { title: "Danh mục", href: "/admin/danh-muc", icon: LayoutGrid },
  { title: "Thương hiệu", href: "/admin/thuong-hieu", icon: Tag },
  { title: "Khách hàng", href: "/admin/khach-hang", icon: Users },
  { title: "Thống kê", href: "/admin/thong-ke", icon: BarChart3 },
  { title: "Kho hàng", href: "/admin/kho-hang", icon: Box },
  { title: "Cài đặt", href: "/admin/cai-dat", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-muted/40">
      <nav className="flex flex-col gap-2 p-4">
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${
              pathname === item.href ? "bg-muted" : ""
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

