import type React from "react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { QueryProvider } from "@/providers/QueryProvider"

export default function PublicRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <PublicLayout>{children}</PublicLayout>
    </QueryProvider>
  )
}

