"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthQuery } from "@/features/auth/hooks";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Package,
  PackageCheck,
  ListChecks,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShipperLayoutProps {
  children: React.ReactNode;
}

export default function ShipperLayout({ children }: ShipperLayoutProps) {
  const { data: session, isLoading } = useAuthQuery();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show loading state
  if (!isMounted || isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const navItems = [
    {
      href: "/shipper",
      label: "Trang chủ",
      icon: <ListChecks className="h-5 w-5 mr-2" />,
    },
    {
      href: "/shipper/don-hang",
      label: "Đơn hàng chờ giao",
      icon: <Package className="h-5 w-5 mr-2" />,
    },
    {
      href: "/shipper/don-hang-dang-giao",
      label: "Đơn hàng đang giao",
      icon: <Package className="h-5 w-5 mr-2" />,
    },
    {
      href: "/shipper/don-hang-da-giao",
      label: "Đơn hàng đã giao",
      icon: <PackageCheck className="h-5 w-5 mr-2" />,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-muted/30">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-64 shrink-0 border-r h-screen sticky top-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-center">Khu vực Shipper</h1>
          </div>
          <div className="flex-1 py-4 px-2">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  asChild
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Link href={item.href}>
                    {item.icon}
                    {item.label}
                  </Link>
                </Button>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/api/auth/signout">
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile header with sidebar */}
      <div className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md lg:hidden border-b flex items-center justify-between h-16 px-4">
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Khu vực Shipper</h1>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t flex justify-around lg:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center py-2 px-1",
              pathname === item.href ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className="flex items-center justify-center">{item.icon}</div>
            <span className="text-xs">{item.label.split(" ")[0]}</span>
          </Link>
        ))}
      </div>

      {/* Main Content Area */}
      <main className={cn("flex-1 flex flex-col min-h-screen pb-16 lg:pb-0")}>
        <div className="flex-1 container py-6 px-4 max-w-full">{children}</div>
      </main>
    </div>
  );
}
