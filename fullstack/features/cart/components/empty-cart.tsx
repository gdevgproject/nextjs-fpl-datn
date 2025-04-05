"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export function EmptyCart() {
  return (
    <div className="container py-16 px-4 text-center">
      <div className="mx-auto max-w-md">
        <div className="relative h-52 w-52 mx-auto mb-8">
          <Image
            src="/images/empty-cart.svg"
            alt="Empty cart"
            fill
            className="object-contain"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.jpg";
            }}
          />
        </div>
        <h1 className="text-3xl font-bold mb-3">Giỏ hàng trống</h1>
        <p className="text-muted-foreground mb-8">
          Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm
          nước hoa tuyệt vời của chúng tôi.
        </p>
        <Button size="lg" asChild>
          <Link href="/san-pham">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Tiếp tục mua sắm
          </Link>
        </Button>
      </div>
    </div>
  );
}
