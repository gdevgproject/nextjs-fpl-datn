"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/auth/logout-button"
import { User, Package, Heart, Star, MapPin, LogOut } from "lucide-react"

const accountNavItems = [
  {
    href: "/tai-khoan/thong-tin",
    label: "Thông tin tài khoản",
    icon: <User className="mr-2 h-4 w-4" />,
  },
  {
    href: "/tai-khoan/dia-chi",
    label: "Sổ địa chỉ",
    icon: <MapPin className="mr-2 h-4 w-4" />,
  },
  {
    href: "/tai-khoan/don-hang",
    label: "Đơn hàng của tôi",
    icon: <Package className="mr-2 h-4 w-4" />,
  },
  {
    href: "/tai-khoan/yeu-thich",
    label: "Danh sách yêu thích",
    icon: <Heart className="mr-2 h-4 w-4" />,
  },
  {
    href: "/tai-khoan/danh-gia",
    label: "Đánh giá của tôi",
    icon: <Star className="mr-2 h-4 w-4" />,
  },
]

export function AccountSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-full space-y-6 pb-16">
      <div className="space-y-1">
        {accountNavItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname === item.href ? "secondary" : "ghost"}
            className={cn("w-full justify-start", pathname === item.href ? "bg-muted font-medium" : "font-normal")}
            asChild
          >
            <Link href={item.href}>
              {item.icon}
              {item.label}
            </Link>
          </Button>
        ))}
      </div>
      <div className="space-y-1">
        <LogoutButton className="w-full justify-start">
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </LogoutButton>
      </div>
    </div>
  )
}

