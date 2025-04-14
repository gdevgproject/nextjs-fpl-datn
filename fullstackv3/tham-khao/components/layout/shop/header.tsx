"use client"

import { useState, useCallback, memo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/features/auth/context/auth-context"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ShoppingCart, Menu, User, Heart } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { MobileNav } from "./mobile-nav"
import { SearchBar } from "./search-bar"
import { UserMenu } from "./user-menu"
import { useCart } from "@/features/shop/cart/context/cart-context"

// Rename the current Header function to HeaderComponent
interface HeaderComponentProps {
  shopLogo: string
  categories: Array<{
    id: number
    name: string
    slug: string
    parent_category_id: number | null
  }>
  genders: Array<{
    id: number
    name: string
  }>
}

function HeaderComponent({ shopLogo, categories, genders }: HeaderComponentProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const { itemCount: cartItemCount, isLoading: isCartLoading } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Memoize the callback functions
  const handleMobileMenuToggle = useCallback((open: boolean) => {
    setMobileMenuOpen(open)
  }, [])

  const mainNavItems = [
    { name: "Nước hoa nam", href: "/san-pham?gender=1" },
    { name: "Nước hoa nữ", href: "/san-pham?gender=2" },
    { name: "Unisex", href: "/san-pham?gender=3" },
    { name: "Danh mục", href: "/danh-muc" },
    { name: "Thương hiệu", href: "/thuong-hieu" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-background shadow-sm">
      {/* Top bar with logo, search, and user actions */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo and brand name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <img src={shopLogo || "/placeholder.svg"} alt="Shop Logo" className="h-8 w-auto mr-2" />
              <span className="text-xl font-bold text-primary">MyBeauty</span>
            </Link>
          </div>

          {/* Search bar - hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <SearchBar />
          </div>

          {/* User actions */}
          <div className="flex items-center space-x-1 md:space-x-3">
            {/* Theme toggle */}
            <ThemeToggle />

            {/* Wishlist */}
            <Button variant="ghost" size="icon" asChild className="hidden sm:flex relative">
              <Link href="/tai-khoan/yeu-thich">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/gio-hang">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {isCartLoading ? "..." : cartItemCount}
                  </Badge>
                )}
                <span className="sr-only">Cart</span>
              </Link>
            </Button>

            {/* User menu or login button */}
            {user ? (
              <UserMenu user={user} />
            ) : (
              <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                <Link href="/login">
                  <User className="mr-2 h-4 w-4" />
                  Đăng nhập
                </Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={handleMobileMenuToggle}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0">
                <MobileNav user={user} navItems={mainNavItems} onNavClick={() => handleMobileMenuToggle(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile search - visible only on mobile */}
        <div className="mt-2 mb-2 md:hidden">
          <SearchBar />
        </div>
      </div>

      {/* Main navigation - hidden on mobile */}
      <nav className="hidden md:block border-t">
        <div className="container mx-auto px-4">
          <ul className="flex items-center space-x-8">
            {genders.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/san-pham?gender=${item.id}`}
                  className={cn(
                    "flex h-12 items-center text-sm font-medium transition-colors hover:text-primary",
                    pathname === `/san-pham?gender=${item.id}` || pathname?.startsWith(`/san-pham?gender=${item.id}/`)
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            {categories.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.slug}
                  className={cn(
                    "flex h-12 items-center text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.slug || pathname?.startsWith(`${item.slug}/`)
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  )
}

// At the end of the file, export the memoized Header component
export const Header = memo(HeaderComponent)
