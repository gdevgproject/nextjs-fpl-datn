import type React from "react"
import { MainLayout } from "@/components/shared/layout/main-layout"

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
}

