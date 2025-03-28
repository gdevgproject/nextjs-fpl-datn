import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { generateMetadata as generateSeoMetadata } from "@/utils/seo"
import { QueryProvider } from "@/providers/QueryProvider"
import { CartProvider } from "@/features/cart/contexts/CartContext"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = generateSeoMetadata({
  title: "Elena Pharmacy",
  description: "Your trusted pharmacy partner",
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <CartProvider>{children}</CartProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

