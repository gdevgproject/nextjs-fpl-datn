"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/lib/hooks/use-cart"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/hooks/use-auth"
import { SessionExpiryHandler } from "@/components/auth/session-expiry-handler"
import { WishlistProvider } from "@/lib/hooks/use-wishlist"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            {children}
            <Toaster />
            <SessionExpiryHandler />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

