"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/features/shop/cart/providers/cart-provider";
import { CheckoutProvider } from "@/features/shop/cart/providers/checkout-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Ensure component only renders on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <QueryProvider>
      {mounted && (
        <CartProvider>
          <CheckoutProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </CheckoutProvider>
        </CartProvider>
      )}
      {!mounted && (
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      )}
    </QueryProvider>
  );
}
