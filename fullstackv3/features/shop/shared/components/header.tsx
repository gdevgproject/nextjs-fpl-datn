"use client";

import { memo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { CartButton } from "@/features/shop/cart/components/cart-button";
import { SearchForm } from "@/features/shop/shared/components/search-form";
import { UserNav } from "@/features/shop/shared/components/user-nav";
import { useShopSettings } from "@/features/shop/shared/hooks/use-shop-settings";
import { useAuthQuery } from "@/features/auth/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import type { ShopSettings } from "@/lib/types/shared.types";

// Placeholder skeleton for Header while loading
function HeaderPlaceholder() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background animate-pulse">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Skeleton className="h-8 w-24 rounded" />
        <div className="flex space-x-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
      <nav className="hidden md:block border-t">
        <div className="container mx-auto px-4 py-2">
          <ul className="flex items-center space-x-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i}>
                <Skeleton className="h-6 w-16 rounded" />
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}

interface HeaderProps {
  shopLogo: string;
  categories: Array<{ id: number; name: string; slug: string }>;
  genders: Array<{ id: number; name: string }>;
  loadingCategories?: boolean;
  loadingGenders?: boolean;
  initialSettings?: ShopSettings;
  loadingSettings?: boolean;
}

export function Header({
  shopLogo,
  categories,
  genders,
  loadingCategories,
  loadingGenders,
  initialSettings,
  loadingSettings,
}: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleMobileMenuToggle = useCallback(
    (open: boolean) => setMobileMenuOpen(open),
    []
  );
  // Use server-provided settings if available, else fetch on client
  const settingsHook = useShopSettings();
  const settings = initialSettings ?? settingsHook.settings;
  const isSettingsLoading =
    initialSettings !== undefined ? loadingSettings : settingsHook.isLoading;
  const { data: session } = useAuthQuery();
  const isAuthenticated = !!session?.user;
  const logoUrl =
    shopLogo || settings?.shop_logo_url || "/placeholder-logo.svg";
  const shopName = settings?.shop_name || "";

  // If still loading settings, categories, or genders, render placeholder
  if (isSettingsLoading || loadingCategories || loadingGenders) {
    return <HeaderPlaceholder />;
  }

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
              src={logoUrl}
              alt={shopName ? `${shopName} Logo` : "Logo"}
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
                <SheetTitle className="sr-only">
                  {shopName ? `Menu - ${shopName}` : "Menu"}
                </SheetTitle>
                {/* Mobile nav content */}
                <nav className="p-6 space-y-2">
                  {/* Show login/register if not authenticated */}
                  {!isAuthenticated && (
                    <div className="flex flex-col gap-3 mb-4">
                      <Link
                        href="/dang-nhap"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button className="w-full" variant="outline">
                          Đăng nhập
                        </Button>
                      </Link>
                      <Link
                        href="/dang-ky"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button className="w-full" variant="default">
                          Đăng ký
                        </Button>
                      </Link>
                    </div>
                  )}
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
