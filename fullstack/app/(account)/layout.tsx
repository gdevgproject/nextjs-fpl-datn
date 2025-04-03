import type React from "react"
import { AccountLayout } from "@/features/account/components/account-layout"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AccountLayout>{children}</AccountLayout>
}

