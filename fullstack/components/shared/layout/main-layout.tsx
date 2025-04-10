"use client"

import { memo } from "react"
import type React from "react"
import { Header } from "./header"
import { Footer } from "./footer"

// Memoized main layout component to prevent unnecessary re-renders
export const MainLayout = memo(function MainLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
})

