"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, LogIn } from "lucide-react";
import { useAuthQuery } from "@/features/auth/hooks";

export function EmptyCart() {
  const { data: session } = useAuthQuery();
  const isAuthenticated = !!session?.user;

  return (
    <div className="container py-16 px-4 text-center flex flex-col items-center justify-center">
      <div className="bg-muted rounded-full p-6 mb-6">
        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold mb-3">Giỏ hàng trống</h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm nước
        hoa tuyệt vời của chúng tôi.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" asChild>
          <Link href="/san-pham">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Tiếp tục mua sắm
          </Link>
        </Button>
        {!isAuthenticated && (
          <Button size="lg" variant="outline" asChild>
            <Link href="/dang-nhap">
              Đăng nhập
              <LogIn className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
