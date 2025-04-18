import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex max-w-md flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-4xl font-bold">Không có quyền truy cập</h1>
        <p className="text-muted-foreground">Bạn không có quyền truy cập vào trang này.</p>
        <Button asChild>
          <Link href="/">Quay lại trang chủ</Link>
        </Button>
      </div>
    </div>
  )
}

