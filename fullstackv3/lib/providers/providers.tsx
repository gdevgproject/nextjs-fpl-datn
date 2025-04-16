"use client";

import type React from "react";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "./query-provider";
import { CartProvider } from "@/features/shop/cart/cart-provider";
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
        <CartProvider>
        <CheckoutProvider>
          {children}
          <Toaster richColors closeButton position="bottom-right" />
          </CheckoutProvider>
        </CartProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
