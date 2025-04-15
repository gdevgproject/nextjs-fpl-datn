import type React from "react"
import { MainLayout } from "@/features/shop/shared/components/main-layout"

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
}

