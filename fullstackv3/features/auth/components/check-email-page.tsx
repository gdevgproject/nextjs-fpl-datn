import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CheckEmailPage() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center">
          <Mail className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">Kiểm tra email của bạn</CardTitle>
        <CardDescription>
        Nếu bạn không nhận được email, vui lòng kiểm tra thư mục spam hoặc thử lại sau.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p>
          <strong>Lưu ý:</strong> Vui lòng nhấp vào liên kết xác nhận trên{" "}
          <b>cùng trình duyệt và thiết bị</b> mà bạn đã đăng ký tài khoản để
          hoàn tất xác thực.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button asChild className="w-full">
          <Link href="/dang-nhap">Quay lại đăng nhập</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
