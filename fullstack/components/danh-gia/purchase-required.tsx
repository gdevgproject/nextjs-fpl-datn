import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ShoppingBag } from "lucide-react"

interface PurchaseRequiredProps {
  productId: number
  productName: string
}

export function PurchaseRequired({ productId, productName }: PurchaseRequiredProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Bạn cần mua sản phẩm để đánh giá</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Để đảm bảo chất lượng đánh giá, chỉ khách hàng đã mua "{productName}" mới có thể viết đánh giá.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center gap-4 pb-6">
        <Button variant="outline" asChild>
          <Link href="/tai-khoan/don-hang">Xem đơn hàng của tôi</Link>
        </Button>
        <Button asChild>
          <Link href={`/san-pham/${productId}`}>Xem sản phẩm</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

