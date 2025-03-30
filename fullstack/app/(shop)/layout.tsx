import type React from "react"
import { Header } from "@/components/layout/header"
import { SiteFooter } from "@/components/layout/site-footer"

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  )
}

