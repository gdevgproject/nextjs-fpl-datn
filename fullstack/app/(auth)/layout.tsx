import type React from "react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthNav } from "@/components/auth/auth-nav"
import { ArrowLeft } from "lucide-react"
import { AuthFooter } from "@/components/auth/auth-footer"

export const metadata: Metadata = {
  title: "Xác thực - MyBeauty",
  description: "Đăng nhập hoặc đăng ký tài khoản MyBeauty",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header với logo */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <Image
                src="/placeholder.svg?height=32&width=32"
                alt="MyBeauty Logo"
                width={32}
                height={32}
                className="rounded-md"
              />
              <span className="font-semibold">MyBeauty</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Quay lại trang chủ</span>
              <span className="sm:hidden">Trang chủ</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="mx-auto mb-6 flex flex-col items-center space-y-2 text-center">
            <div className="relative mb-4 h-20 w-20 overflow-hidden rounded-full bg-primary/10 p-2">
              <Image
                src="/placeholder.svg?height=80&width=80"
                alt="MyBeauty"
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">MyBeauty</h1>
            <p className="text-sm text-muted-foreground">Nền tảng mua sắm nước hoa hàng đầu</p>
          </div>

          <AuthNav />

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">{children}</div>
          </div>

          <div className="mt-4">
            <AuthFooter />
          </div>
        </div>
      </main>
    </div>
  )
}

