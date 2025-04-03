"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AuthProvider } from "./auth-context"
import { QueryProvider } from "./query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/features/cart/providers/cart-provider"
import { OrderProvider } from "@/features/orders/providers/order-provider"
import { WishlistProvider } from "@/features/wishlist/providers/wishlist-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Đảm bảo component chỉ render ở client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <QueryProvider>
      <AuthProvider>
        {mounted && (
          <>
            <CartProvider>
              <WishlistProvider>
                <OrderProvider>
                  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    {children}
                  </ThemeProvider>
                </OrderProvider>
              </WishlistProvider>
            </CartProvider>
          </>
        )}
        {!mounted && (
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        )}
      </AuthProvider>
    </QueryProvider>
  )
}

