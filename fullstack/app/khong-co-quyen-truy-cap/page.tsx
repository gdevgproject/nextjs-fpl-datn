import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

export const metadata: Metadata = {
  title: "Không có quyền truy cập - MyBeauty",
  description: "Bạn không có quyền truy cập vào trang này",
}

export default function UnauthorizedPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] py-12 text-center">
      <ShieldAlert className="h-24 w-24 text-destructive mb-6" />
      <h1 className="text-3xl font-bold tracking-tight mb-2">Không có quyền truy cập</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">Quay lại trang chủ</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/lien-he">Liên hệ hỗ trợ</Link>
        </Button>
      </div>
    </div>
  )
}

