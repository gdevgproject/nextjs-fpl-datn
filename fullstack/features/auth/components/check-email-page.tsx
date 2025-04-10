import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function CheckEmailPage() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center">
          <Mail className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">Kiểm tra email của bạn</CardTitle>
        <CardDescription>Chúng tôi đã gửi một email xác nhận đến địa chỉ email của bạn.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p>Vui lòng kiểm tra hộp thư đến và nhấp vào liên kết xác nhận để hoàn tất quá trình đăng ký.</p>
        <p className="text-sm text-muted-foreground">
          Nếu bạn không nhận được email, vui lòng kiểm tra thư mục spam hoặc thử lại sau.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button asChild className="w-full">
          <Link href="/dang-nhap">Quay lại đăng nhập</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

