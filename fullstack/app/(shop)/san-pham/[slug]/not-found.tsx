import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PackageX } from "lucide-react"

export default function ProductNotFound() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-12">
      <PackageX className="h-24 w-24 text-muted-foreground" />
      <h1 className="mt-6 text-3xl font-bold">Sản phẩm không tồn tại</h1>
      <p className="mt-2 text-center text-muted-foreground">
        Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống.
      </p>
      <div className="mt-6 flex gap-4">
        <Button asChild>
          <Link href="/san-pham">Xem tất cả sản phẩm</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Quay lại trang chủ</Link>
        </Button>
      </div>
    </div>
  )
}

