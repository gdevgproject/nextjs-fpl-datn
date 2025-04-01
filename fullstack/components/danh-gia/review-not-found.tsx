import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { FileX } from "lucide-react"

export function ReviewNotFound() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <FileX className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Không tìm thấy đánh giá</h3>
        <p className="mt-2 text-sm text-muted-foreground">Đánh giá bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
      </CardContent>
      <CardFooter className="flex justify-center pb-6">
        <Button asChild>
          <Link href="/tai-khoan/danh-gia">Quay lại danh sách đánh giá</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

