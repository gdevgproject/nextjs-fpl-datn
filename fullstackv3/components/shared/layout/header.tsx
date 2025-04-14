"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CartButton } from "@/features/shop/cart/components/cart-button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchForm } from "./search-form";
import { UserNav } from "./user-nav";
import { useShopSettings } from "@/features/shop/shared/hooks/use-shop-settings";
import { useAuthQuery, useLogoutMutation } from "@/features/auth/hooks";

const mainNavItems = [
  { title: "Trang chủ", href: "/" },
  { title: "Sản phẩm", href: "/san-pham" },
  { title: "Thương hiệu", href: "/thuong-hieu" },
  { title: "Khuyến mãi", href: "/khuyen-mai" },
  { title: "Giới thiệu", href: "/gioi-thieu" },
  { title: "Liên hệ", href: "/lien-he" },
];

export const Header = memo(function Header() {
  const pathname = usePathname();
  const { data: session, isLoading: isAuthLoading } = useAuthQuery();
  const isAuthenticated = !!session?.user;
  const logoutMutation = useLogoutMutation();
  const signOut = () => logoutMutation.mutate();
  const [mounted, setMounted] = useState(false);
  const { settings, isLoading: isLoadingSettings } = useShopSettings();

  useEffect(() => {
    setMounted(true);
  }, []);

  const shopName = settings?.shop_name || "MyBeauty";

  if (!mounted || isAuthLoading) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <div className="rounded-lg overflow-hidden">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
              </div>
              <span className="font-bold text-xl hidden sm:inline-block">
                <Skeleton className="h-6 w-24" />
              </span>
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
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <div className="rounded-lg overflow-hidden">
              <Image
                src="/images/logo.png"
                alt={`${shopName} Logo`}
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                priority
              />
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">
              {isLoadingSettings ? <Skeleton className="h-6 w-24" /> : shopName}
            </span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <SearchForm />
          <CartButton />
          <UserNav />
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="rounded-lg overflow-hidden">
                    <Image
                      src="/images/logo.png"
                      alt={`${shopName} Logo`}
                      width={40}
                      height={40}
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <span className="font-bold text-xl">
                    {isLoadingSettings ? (
                      <Skeleton className="h-6 w-24" />
                    ) : (
                      shopName
                    )}
                  </span>
                </Link>
                {mainNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      pathname === item.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.title}
                  </Link>
                ))}
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    onClick={signOut}
                    className="justify-start px-0"
                    disabled={isAuthLoading}
                  >
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
  );
});
