import type React from "react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Xác thực - MyBeauty",
  description: "Đăng nhập, đăng ký và quản lý tài khoản MyBeauty của bạn",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container flex-1 flex items-center justify-center py-12">
        <div className="grid w-full lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="hidden lg:flex flex-col space-y-4 items-center justify-center">
            <Link href="/" className="mb-6">
              <Image
                src="/placeholder.svg?height=80&width=240"
                alt="MyBeauty Logo"
                width={240}
                height={80}
                className="mx-auto"
                priority
              />
            </Link>
            <div className="relative w-full aspect-square">
              <Image
                src="/placeholder.svg?height=500&width=500"
                alt="Nước hoa MyBeauty"
                fill
                className="object-cover rounded-xl"
                priority
              />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">MyBeauty Perfume</h2>
              <p className="text-muted-foreground">Khám phá bộ sưu tập nước hoa độc đáo và sang trọng</p>
            </div>
          </div>
          <div className="lg:p-8">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
              <div className="flex flex-col space-y-2 text-center">
                <Link href="/" className="mb-6 lg:hidden">
                  <Image
                    src="/placeholder.svg?height=60&width=180"
                    alt="MyBeauty Logo"
                    width={180}
                    height={60}
                    className="mx-auto"
                    priority
                  />
                </Link>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

