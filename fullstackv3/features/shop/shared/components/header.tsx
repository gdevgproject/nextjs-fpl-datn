"use client";

import { memo, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CartButton } from "@/features/shop/cart/components/cart-button";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_AVATAR_URL } from "@/lib/constants";
import { SearchForm } from "@/features/shop/shared/components/search-form";
import { UserNav } from "./user-nav";
import { useShopSettings } from "@/features/shop/shared/hooks/use-shop-settings";
import { useAuthQuery, useLogoutMutation } from "@/features/auth/hooks";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

const mainNavItems = [
  { title: "Trang chủ", href: "/" },
  { title: "Sản phẩm", href: "/san-pham" },
  { title: "Thương hiệu", href: "/thuong-hieu" },
  { title: "Khuyến mãi", href: "/khuyen-mai" },
  { title: "Giới thiệu", href: "/gioi-thieu" },
  { title: "Liên hệ", href: "/lien-he" },
];

function ShopNameLogo({
  shopName,
  logoUrl,
  isLoadingSettings,
}: {
  shopName: string;
  logoUrl: string;
  isLoadingSettings: boolean;
}) {
  return (
    <>
      <div className="rounded-lg overflow-hidden">
        <Image
          src={logoUrl || "/images/logo.png"}
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
    </>
  );
}

export const Header = memo(function Header() {
  const pathname = usePathname();
  const { data: session, isLoading: isAuthLoading } = useAuthQuery();
  const isAuthenticated = !!session?.user;
  const logoutMutation = useLogoutMutation();
  const { success, error } = useSonnerToast();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      success("Đăng xuất thành công", {
        description: "Bạn đã đăng xuất khỏi tài khoản.",
      });
    } catch (err) {
      error("Đăng xuất thất bại", {
        description: "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.",
      });
    }
  };

  const [mounted, setMounted] = useState(false);
  const { settings, isLoading: isLoadingSettings } = useShopSettings();
  const shopName = settings?.shop_name || "MyBeauty";
  const logoUrl = settings?.shop_logo_url || "/placeholder-logo.png";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isAuthLoading) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex flex-col gap-0 px-2 sm:px-4 xl:px-8 2xl:px-16">
          {/* Top bar skeleton */}
          <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-[48px]">
              <Link href="/" className="flex items-center space-x-2">
                <ShopNameLogo
                  shopName={shopName}
                  logoUrl={logoUrl}
                  isLoadingSettings={isLoadingSettings}
                />
              </Link>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 min-w-[120px] justify-end">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              {/* Hamburger menu skeleton on mobile */}
              <Skeleton className="h-8 w-8 rounded-full md:hidden" />
            </div>
          </div>
          {/* Search bar on mobile: show below top bar */}
          <div className="block md:hidden w-full py-2">
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
          {/* Menu bar skeleton: only show on md+ */}
          <nav className="hidden md:flex gap-2 sm:gap-4 justify-center border-t bg-background/80 backdrop-blur py-2 overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
            {mainNavItems.map((item) => (
              <Skeleton key={item.href} className="h-4 w-20" />
            ))}
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex flex-col gap-0 px-2 sm:px-4 xl:px-8 2xl:px-16">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-[48px]">
            <Link href="/" className="flex items-center space-x-2">
              <ShopNameLogo
                shopName={shopName}
                logoUrl={settings?.shop_logo_url || logoUrl}
                isLoadingSettings={isLoadingSettings}
              />
            </Link>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 min-w-[120px] justify-end">
            <CartButton />
            <UserNav settings={settings} />
            <ThemeToggle />
            {/* Hamburger menu on mobile */}
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
                    <ShopNameLogo
                      shopName={shopName}
                      logoUrl={settings?.shop_logo_url || logoUrl}
                      isLoadingSettings={isLoadingSettings}
                    />
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
                      onClick={handleLogout}
                      className="justify-start px-0"
                      disabled={isAuthLoading || logoutMutation.isPending}
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
        {/* Search bar: show below top bar on mobile, inline on md+ */}
        <div className="block md:hidden w-full py-2">
          <SearchForm />
        </div>
        {/* Menu bar: only show on md+ */}
        <nav className="hidden md:flex gap-2 sm:gap-4 justify-center border-t bg-background/80 backdrop-blur py-2 overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors px-3 py-1 rounded-full hover:bg-primary/10 hover:text-primary whitespace-nowrap ${
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.title}
            </Link>
          ))}
        </nav>
        {/* Search bar inline on md+ */}
        <div className="hidden md:flex w-full justify-center py-2">
          <div className="w-full max-w-2xl">
            <SearchForm />
          </div>
        </div>
      </div>
    </header>
  );
});
