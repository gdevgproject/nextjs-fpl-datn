import type { Metadata } from "next"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "@/components/auth/login-form"
import { MagicLinkForm } from "@/components/auth/magic-link-form"

export const metadata: Metadata = {
  title: "Đăng nhập - MyBeauty",
  description: "Đăng nhập vào tài khoản MyBeauty của bạn",
}

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Đăng nhập</h1>
      <p className="text-sm text-muted-foreground mb-4">Chọn phương thức đăng nhập của bạn</p>

      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="password">Mật khẩu</TabsTrigger>
          <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
        </TabsList>
        <TabsContent value="password">
          <LoginForm />
        </TabsContent>
        <TabsContent value="magic-link">
          <MagicLinkForm />
        </TabsContent>
      </Tabs>

      <p className="px-8 text-center text-sm text-muted-foreground mt-4">
        Chưa có tài khoản?{" "}
        <Link href="/dang-ky" className="underline underline-offset-4 hover:text-primary">
          Đăng ký
        </Link>
      </p>
    </>
  )
}

