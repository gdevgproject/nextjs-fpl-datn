import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex max-w-md flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Trang không tồn tại</h2>
        <p className="text-muted-foreground">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
        <Button asChild>
          <Link href="/">Quay lại trang chủ</Link>
        </Button>
      </div>
    </div>
  )
}

