"use client"

import type React from "react"

import { ThemeProvider } from "./theme-provider"
import { ToastProvider } from "./toast-provider"
import { AuthProvider } from "@/features/auth/context/auth-context"
import QueryProvider from "./query-provider"
import { CartProvider as CartProviderComponent } from "@/features/shop/cart/context/cart-context"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <CartProviderComponent>
            <ToastProvider>{children}</ToastProvider>
          </CartProviderComponent>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
