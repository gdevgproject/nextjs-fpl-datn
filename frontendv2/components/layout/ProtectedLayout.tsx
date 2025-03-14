import type React from "react"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { ThemeProvider } from "@/contexts/ThemeContext"

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

