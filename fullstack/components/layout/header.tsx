"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AuthStatus } from "@/components/auth/auth-status"
import { ShoppingCart, Menu, X, User, Package, Heart, Star, MapPin } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/hooks/use-auth"

const mainNavItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/san-pham", label: "Sản phẩm" },
  { href: "/thuong-hieu", label: "Thương hiệu" },
  { href: "/lien-he", label: "Liên hệ" },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/placeholder.svg?height=32&width=120"
              alt="MyBeauty Logo"
              width={120}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:flex gap-6">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/gio-hang">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {/* Hiển thị số lượng sản phẩm trong giỏ hàng */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                0
              </span>
            </Button>
          </Link>

          <AuthStatus />

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href ? "text-primary" : "text-muted-foreground",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {user && (
                <>
                  <Link
                    href="/tai-khoan/thong-tin"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Thông tin tài khoản
                  </Link>
                  <Link
                    href="/tai-khoan/dia-chi"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Địa chỉ của tôi
                  </Link>
                  <Link
                    href="/tai-khoan/don-hang"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Đơn hàng của tôi
                  </Link>
                  <Link
                    href="/tai-khoan/yeu-thich"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Danh sách yêu thích
                  </Link>
                  <Link
                    href="/tai-khoan/danh-gia"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Đánh giá của tôi
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

