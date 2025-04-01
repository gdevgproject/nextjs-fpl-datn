import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

interface ReviewSubmittedProps {
  productId: number
  productName: string
  message: string
}

export function ReviewSubmitted({ productId, productName, message }: ReviewSubmittedProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <h3 className="mt-4 text-lg font-medium">Đánh giá đã được gửi</h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </CardContent>
      <CardFooter className="flex justify-center gap-4 pb-6">
        <Button variant="outline" asChild>
          <Link href="/tai-khoan/danh-gia">Xem đánh giá của tôi</Link>
        </Button>
        <Button asChild>
          <Link href={`/san-pham/${productId}`}>Quay lại sản phẩm</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

