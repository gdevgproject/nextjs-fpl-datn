// File: lib/providers/providers.tsx

"use client";

import type React from "react";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "./query-provider";
import { Toaster } from "@/components/ui/sonner";

/**
 * Central provider component that wraps all global providers.
 * This follows the dev-guide.txt recommendation to centralize providers.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {/* CheckoutProvider đã được di chuyển vào layout riêng để tránh lỗi build */}
        {children}
        <Toaster richColors closeButton position="bottom-left" />
      </ThemeProvider>
    </QueryProvider>
  );
}
