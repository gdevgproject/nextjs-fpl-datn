"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar, MobileAdminSidebar } from "./admin-sidebar";
import { useAuthQuery } from "@/features/auth/hooks";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, isLoading } = useAuthQuery();
  const user = session?.user;
  const isAdmin = user?.app_metadata?.role === "admin";
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

  // Check if user is admin
  if (!isAdmin) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Quyền truy cập bị từ chối</h1>
        <p className="text-muted-foreground mb-4">
          Bạn không có quyền truy cập vào trang quản trị.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-muted/30">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-64 xl:w-72 shrink-0 border-r h-screen sticky top-0">
        <AdminSidebar />
      </div>

      {/* Mobile header with sidebar trigger button */}
      <div className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md lg:hidden border-b flex items-center justify-between h-16 px-4">
        <MobileAdminSidebar />
        <div className="flex-1 flex justify-center">
          <h1 className="text-lg font-semibold">MyBeauty Admin</h1>
        </div>
        <div className="w-10"></div> {/* Space balance */}
      </div>

      {/* Main Content Area */}
      <main className={cn("flex-1 flex flex-col min-h-screen")}>
        <div className="flex-1 container py-6 md:py-8 px-4 max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
