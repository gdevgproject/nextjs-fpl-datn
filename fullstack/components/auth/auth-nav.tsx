"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface AuthNavItem {
  title: string
  href: string
  description: string
}

const authNavItems: AuthNavItem[] = [
  {
    title: "Đăng nhập",
    href: "/dang-nhap",
    description: "Đăng nhập vào tài khoản của bạn",
  },
  {
    title: "Đăng ký",
    href: "/dang-ky",
    description: "Tạo tài khoản mới",
  },
]

export function AuthNav() {
  const pathname = usePathname()

  // Không hiển thị nav trên các trang đặc biệt
  if (
    pathname === "/quen-mat-khau" ||
    pathname === "/dat-lai-mat-khau" ||
    pathname === "/xac-nhan-email" ||
    pathname.includes("/dat-lai-mat-khau/")
  ) {
    return null
  }

  return (
    <div className="mb-6">
      <nav className="flex space-x-2 rounded-lg border bg-card p-1">
        {authNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative",
                isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-primary rounded-md z-0"
                  layoutId="authNavBackground"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

