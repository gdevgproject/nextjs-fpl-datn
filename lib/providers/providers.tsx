"use client";

import type React from "react";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "./query-provider";
import { CheckoutProvider } from "@/features/shop/checkout/checkout-provider";
import { Toaster } from "@/components/ui/sonner";

/**
 * Central provider component that wraps all global providers.
 * This follows the dev-guide.txt recommendation to centralize providers.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {/* CartProvider removed: Cart state is managed by TanStack Query and guest-cart context if needed */}
        <CheckoutProvider>
          {children}
          <Toaster richColors closeButton position="bottom-left" />
        </CheckoutProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
