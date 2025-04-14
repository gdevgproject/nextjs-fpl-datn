import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Xác nhận email - MyBeauty",
  description: "Xác nhận email cho tài khoản MyBeauty của bạn",
}

export default function Page() {
  return (
    <div className="flex flex-col space-y-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Xác nhận email</h1>
      <p className="text-sm text-muted-foreground">
        Vui lòng kiểm tra email của bạn và nhấp vào liên kết xác nhận để hoàn tất quá trình đăng ký.
      </p>
      <p className="text-sm text-muted-foreground">
        Nếu bạn không nhận được email, vui lòng kiểm tra thư mục spam hoặc thử đăng ký lại.
      </p>
      <div className="flex flex-col gap-2">
        <Button asChild variant="outline">
          <Link href="/dang-ky">Đăng ký lại</Link>
        </Button>
        <Button asChild>
          <Link href="/">Quay lại trang chủ</Link>
        </Button>
      </div>
    </div>
  )
}

