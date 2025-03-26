"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { User, MapPin, Package, Heart, Star } from "lucide-react"

const accountLinks = [
  {
    href: "/tai-khoan/thong-tin",
    label: "Thông tin tài khoản",
    icon: User,
  },
  {
    href: "/tai-khoan/dia-chi",
    label: "Địa chỉ của tôi",
    icon: MapPin,
  },
  {
    href: "/tai-khoan/don-hang",
    label: "Đơn hàng của tôi",
    icon: Package,
  },
  {
    href: "/tai-khoan/yeu-thich",
    label: "Danh sách yêu thích",
    icon: Heart,
  },
  {
    href: "/tai-khoan/danh-gia",
    label: "Đánh giá của tôi",
    icon: Star,
  },
]

export function AccountSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-2 px-4 text-sm font-medium text-muted-foreground">Tài khoản của tôi</div>
      <nav className="flex flex-col gap-1">
        {accountLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "justify-start",
                isActive && "bg-muted font-medium text-foreground",
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

