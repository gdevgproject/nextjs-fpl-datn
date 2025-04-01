import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

export function UserReviewsEmpty() {
  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="flex justify-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-medium">Chưa có đánh giá nào</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Bạn chưa viết đánh giá nào cho sản phẩm đã mua. Hãy chia sẻ trải nghiệm của bạn để giúp người khác có quyết
          định mua hàng tốt hơn.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button asChild>
          <Link href="/tai-khoan/don-hang">Xem đơn hàng của tôi</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

