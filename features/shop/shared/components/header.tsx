"use client";

import { memo, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown, Heart } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ShopSettings } from "@/lib/types/shared.types";

// Placeholder skeleton for Header while loading
function HeaderPlaceholder() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md animate-pulse">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Skeleton className="h-8 w-24 rounded-md" />
        <div className="flex space-x-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <nav className="hidden md:block border-t border-border/40">
        <div className="container mx-auto px-4 py-2">
          <ul className="flex items-center space-x-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i}>
                <Skeleton className="h-6 w-20 rounded-full" />
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
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position for header appearance
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-lg shadow-md"
          : "bg-background/80 backdrop-blur-sm"
      )}
    >
      {/* Topbar */}
      <div className="container mx-auto px-4 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="overflow-hidden rounded-md transition-all duration-300 group-hover:shadow-md">
              <Image
                src={logoUrl}
                alt={shopName ? `${shopName} Logo` : "Logo"}
                width={36}
                height={36}
                className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight transition-colors duration-300 group-hover:text-primary/80">
              {shopName}
            </span>
          </Link>

          {/* Search desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <SearchForm />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1.5 md:space-x-3">
            {/* Desktop navigation buttons */}
            <div className="hidden md:flex items-center gap-1.5">
              <ThemeToggle />
              <Link href="/tai-khoan/yeu-thich">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-primary/10 dark:hover:bg-primary/20"
                >
                  <Heart className="h-[1.2rem] w-[1.2rem] text-muted-foreground hover:text-primary transition-colors" />
                  <span className="sr-only">Yêu thích</span>
                </Button>
              </Link>
              <CartButton />
            </div>

            <UserNav />

            {/* Mobile buttons */}
            <div className="flex md:hidden items-center gap-1">
              <ThemeToggle />
              <CartButton />

              {/* Mobile menu button */}
              <Sheet
                open={mobileMenuOpen}
                onOpenChange={handleMobileMenuToggle}
              >
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10 dark:hover:bg-primary/20"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="p-0 w-[85%] max-w-[320px]"
                >
                  <SheetTitle className="sr-only">
                    {shopName ? `Menu - ${shopName}` : "Menu"}
                  </SheetTitle>
                  {/* Mobile nav content */}
                  <ScrollArea className="h-full">
                    <nav className="p-6 space-y-2">
                      {/* Show login/register if not authenticated */}
                      {!isAuthenticated && (
                        <div className="flex flex-col gap-3 mb-6 mt-2">
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

                      {/* Navigation links */}
                      <div className="py-2 border-y border-border/50">
                        {mainNavItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "flex items-center py-2.5 px-3 rounded-md transition-all duration-200",
                              pathname === item.href
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-foreground hover:bg-muted"
                            )}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>

                      {/* Additional mobile links */}
                      <div className="pt-2">
                        <Link
                          href="/tai-khoan/yeu-thich"
                          className="flex items-center gap-2 py-2.5 px-3 rounded-md hover:bg-muted text-foreground"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Heart className="h-4 w-4" />
                          <span>Yêu thích</span>
                        </Link>

                        <Link
                          href="/gio-hang"
                          className="flex items-center gap-2 py-2.5 px-3 rounded-md hover:bg-muted text-foreground"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="8" cy="21" r="1" />
                            <circle cx="19" cy="21" r="1" />
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                          </svg>
                          <span>Giỏ hàng</span>
                        </Link>
                      </div>
                    </nav>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Search mobile */}
        <div className="mt-2.5 mb-2 md:hidden">
          <SearchForm />
        </div>
      </div>

      {/* Main nav desktop */}
      <nav
        className={cn(
          "hidden md:block border-t border-b transition-all duration-300",
          scrolled
            ? "border-transparent border-b-border/30"
            : "border-border/30"
        )}
      >
        <div className="container mx-auto px-4">
          <ul className="flex items-center flex-wrap">
            {mainNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex h-11 items-center px-3 text-sm font-medium transition-colors group",
                    pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.name}
                  {pathname === item.href && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />
                  )}
                  <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
