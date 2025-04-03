"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AuthProvider } from "./auth-context"
import { QueryProvider } from "./query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/features/cart/providers/cart-provider"
import { WishlistProvider } from "@/features/wishlist/providers/wishlist-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Ensure component only renders on client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <QueryProvider>
      <AuthProvider>
        {mounted && (
          <WishlistProvider>
            <CartProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                {children}
              </ThemeProvider>
            </CartProvider>
          </WishlistProvider>
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

