"use client";

import { memo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CartButton } from "@/features/shop/cart/components/cart-button";
import { SearchForm } from "@/features/shop/shared/components/search-form";
import { UserNav } from "@/features/shop/shared/components/user-nav";
import { useShopSettings } from "@/features/shop/shared/hooks/use-shop-settings";

interface HeaderProps {
  categories: Array<{ id: number; name: string; slug: string }>;
  genders: Array<{ id: number; name: string }>;
}

export function Header({ categories, genders }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleMobileMenuToggle = useCallback(
    (open: boolean) => setMobileMenuOpen(open),
    []
  );
  const { settings } = useShopSettings();
  const shopLogo = settings?.shop_logo_url || "/placeholder-logo.svg";
  const shopName = settings?.shop_name || "MyBeauty";

  // Main nav items (genders + categories)
  const mainNavItems = [
    ...genders.map((g) => ({ name: g.name, href: `/san-pham?gender=${g.id}` })),
    ...categories.map((c) => ({
      name: c.name,
      href: c.slug.startsWith("/") ? c.slug : "/" + c.slug,
    })),
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background shadow-sm">
      {/* Topbar */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img
              src={shopLogo}
              alt="Logo"
              className="h-8 w-auto mr-2 rounded-md border border-border"
            />
            <span className="text-xl font-bold text-primary">{shopName}</span>
          </Link>
          {/* Search desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <SearchForm />
          </div>
          {/* Actions */}
          <div className="flex items-center space-x-1 md:space-x-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hidden sm:flex relative"
            >
              <Link href="/tai-khoan/yeu-thich">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Yêu thích</span>
              </Link>
            </Button>
            <CartButton />
            <UserNav />
            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={handleMobileMenuToggle}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0">
                {/* Mobile nav content */}
                <nav className="p-6 space-y-2">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block py-2 px-3 rounded hover:bg-muted ${
                        pathname === item.href
                          ? "text-primary font-semibold"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Link
                    href="/tai-khoan/yeu-thich"
                    className="block py-2 px-3 rounded hover:bg-muted text-muted-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Yêu thích
                  </Link>
                  <Link
                    href="/gio-hang"
                    className="block py-2 px-3 rounded hover:bg-muted text-muted-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Giỏ hàng
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {/* Search mobile */}
        <div className="mt-2 mb-2 md:hidden">
          <SearchForm />
        </div>
      </div>
      {/* Main nav desktop */}
      <nav className="hidden md:block border-t">
        <div className="container mx-auto px-4">
          <ul className="flex items-center space-x-8">
            {mainNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex h-12 items-center text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
