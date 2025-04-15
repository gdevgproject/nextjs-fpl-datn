"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CartButton } from "@/features/shop/cart/components/cart-button";
import { SearchForm } from "@/features/shop/shared/components/search-form";
import { UserNav } from "./user-nav";
import { useShopSettings } from "@/features/shop/shared/hooks/use-shop-settings";

// Main navigation items - extracted as a constant to prevent re-creation
const mainNavItems = [
  { title: "Trang chủ", href: "/" },
  { title: "Sản phẩm", href: "/san-pham" },
  { title: "Thương hiệu", href: "/thuong-hieu" },
  { title: "Khuyến mãi", href: "/khuyen-mai" },
  { title: "Giới thiệu", href: "/gioi-thieu" },
  { title: "Liên hệ", href: "/lien-he" },
];

// Extracted ShopNameLogo as a memoized component to avoid re-renders
const ShopNameLogo = memo(function ShopNameLogo({
  shopName,
  logoUrl,
}: {
  shopName: string;
  logoUrl: string;
}) {
  return (
    <>
      <div className="rounded-[10px] overflow-hidden border border-border bg-background">
        <Image
          src={logoUrl}
          alt={`${shopName} Logo`}
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
          priority
        />
      </div>
      <span className="font-bold text-xl hidden sm:inline-block">
        {shopName}
      </span>
    </>
  );
});

// Extracted NavigationItems as a memoized component
const NavigationItems = memo(function NavigationItems({
  pathname,
}: {
  pathname: string;
}) {
  return (
    <>
      {mainNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`text-sm font-medium transition-colors px-3 py-1 rounded-[8px] hover:bg-primary/10 hover:text-primary whitespace-nowrap border border-transparent ${
            pathname === item.href
              ? "bg-primary/10 text-primary border-primary/30"
              : "text-muted-foreground"
          }`}
        >
          {item.title}
        </Link>
      ))}
    </>
  );
});

/**
 * Main Header component - optimized with React.memo to prevent unnecessary re-renders
 * Follows the dev-guide.txt principles for client-side components
 */
export const Header = memo(function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { settings } = useShopSettings();

  // Default values to prevent null references and improve UX
  const shopName = settings?.shop_name || "MyBeauty";
  const logoUrl = settings?.shop_logo_url || "/placeholder-logo.png";

  // Handle hydration mismatch with useEffect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Guard against hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex flex-col gap-0 px-2 sm:px-4 xl:px-8 2xl:px-16">
        {/* Top bar: logo, search, actions */}
        <div className="flex flex-wrap md:flex-nowrap h-auto md:h-20 items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-[48px] flex-shrink-0 mb-2 md:mb-0">
            <Link href="/" className="flex items-center space-x-2">
              <ShopNameLogo shopName={shopName} logoUrl={logoUrl} />
            </Link>
          </div>
          {/* Search bar: mobile hiển thị dưới logo, full width, margin rõ ràng */}
          <div className="w-full order-3 md:order-none md:flex-1 flex justify-center px-0 md:px-2 min-w-0 md:mb-0 mb-2">
            <div className="w-full max-w-xl">
              <SearchForm mobile />
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 min-w-[120px] justify-end flex-shrink-0 mb-2 md:mb-0">
            <CartButton />
            <UserNav settings={settings} />
            <ThemeToggle />
            {/* Hamburger menu on mobile */}
            <MobileMenu
              shopName={shopName}
              logoUrl={logoUrl}
              pathname={pathname}
            />
          </div>
        </div>
        {/* Menu bar: only show on md+ */}
        <nav className="hidden md:flex gap-2 sm:gap-4 justify-center border-t bg-background/80 backdrop-blur py-2 overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
          <NavigationItems pathname={pathname} />
        </nav>
      </div>
    </header>
  );
});

// Extracted MobileMenu as a separate component
const MobileMenu = memo(function MobileMenu({
  shopName,
  logoUrl,
  pathname,
}: {
  shopName: string;
  logoUrl: string;
  pathname: string;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-[10px] border border-border"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="rounded-l-[14px] p-0 max-w-[320px] w-full border-l border-border bg-background shadow-xl"
      >
        <div className="flex flex-col gap-0 h-full">
          <div className="flex items-center gap-2 px-5 py-6 border-b border-border">
            <div className="rounded-[10px] overflow-hidden border border-border bg-background">
              <Image
                src={logoUrl}
                alt={`${shopName} Logo`}
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </div>
            <span className="font-bold text-xl">{shopName}</span>
          </div>
          <nav className="flex flex-col gap-1 px-3 py-4">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-base font-medium transition-colors px-3 py-2 rounded-[8px] border border-transparent hover:bg-primary/10 hover:text-primary ${
                  pathname === item.href
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "text-muted-foreground"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
});
