import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

export function WishlistEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <div className="rounded-full bg-muted p-3">
        <Heart className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-medium">Danh sách yêu thích trống</h3>
      <p className="mt-2 mb-6 max-w-md text-sm text-muted-foreground">
        Bạn chưa có sản phẩm nào trong danh sách yêu thích. Hãy thêm sản phẩm vào danh sách yêu thích để dễ dàng theo
        dõi và mua sau.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild>
          <Link href="/san-pham">Khám phá sản phẩm</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/san-pham/ban-chay">Xem sản phẩm bán chạy</Link>
        </Button>
      </div>
    </div>
  )
}

