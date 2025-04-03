"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { User, Search, Menu, LogOut, Settings, Package, Heart, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/providers/auth-context"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CartButton } from "@/features/cart/components/cart-button"
import { DEFAULT_AVATAR_URL } from "@/lib/constants"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"

const mainNavItems = [
  { title: "Trang chủ", href: "/" },
  { title: "Sản phẩm", href: "/san-pham" },
  { title: "Thương hiệu", href: "/thuong-hieu" },
  { title: "Khuyến mãi", href: "/khuyen-mai" },
  { title: "Giới thiệu", href: "/gioi-thieu" },
  { title: "Liên hệ", href: "/lien-he" },
]

export function Header() {
  const pathname = usePathname()
  const { user, profile, signOut, isAuthenticated, isLoading, profileImageUrl, role } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Đảm bảo component chỉ render ở client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Xử lý đăng xuất
  const handleSignOut = async () => {
    await signOut()
  }

  // Nếu chưa mounted, hiển thị skeleton
  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/images/logo.png" alt="MyBeauty Logo" width={120} height={40} className="h-10 w-auto" />
            </Link>
            <nav className="hidden gap-6 md:flex">
              {mainNavItems.map((item) => (
                <Skeleton key={item.href} className="h-4 w-20" />
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/images/logo.png" alt="MyBeauty Logo" width={120} height={40} className="h-10 w-auto" />
          </Link>
          <nav className="hidden gap-6 md:flex">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/tim-kiem">
              <Search className="h-5 w-5" />
              <span className="sr-only">Tìm kiếm</span>
            </Link>
          </Button>
          <CartButton />

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                  {isLoading ? (
                    <Skeleton className="h-8 w-8 rounded-full" />
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={profileImageUrl}
                        alt={profile?.display_name || "Avatar"}
                        className="object-cover"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement
                          target.src = DEFAULT_AVATAR_URL
                        }}
                      />
                      <AvatarFallback>{profile?.display_name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.display_name || "Người dùng"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {/* Thêm lựa chọn trang quản trị cho admin và staff */}
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
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dang-nhap">Đăng nhập</Link>
            </Button>
          )}

          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      pathname === item.href ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {item.title}
                  </Link>
                ))}
                {isAuthenticated && (
                  <Button variant="ghost" onClick={handleSignOut} className="justify-start px-0">
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

