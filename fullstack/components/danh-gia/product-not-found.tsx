import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { PackageX } from "lucide-react"

export function ProductNotFound() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <PackageX className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Không tìm thấy sản phẩm</h3>
        <p className="mt-2 text-sm text-muted-foreground">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
      </CardContent>
      <CardFooter className="flex justify-center pb-6">
        <Button asChild>
          <Link href="/tai-khoan/don-hang">Xem đơn hàng của tôi</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

