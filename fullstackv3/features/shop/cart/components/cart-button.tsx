"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartQuery } from "../use-cart";

export function CartButton() {
  const { data: cartItems = [] } = useCartQuery();
  // Số sản phẩm là số biến thể khác nhau trong giỏ hàng
  const productCount = cartItems.length;

  return (
    <Button
      variant="ghost"
      size="icon"
      asChild
      className="relative"
      aria-label="Shopping cart"
    >
      <Link href="/gio-hang">
        <ShoppingCart className="h-5 w-5" />
        {productCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {productCount > 99 ? "99+" : productCount}
          </span>
        )}
        <span className="sr-only">Giỏ hàng</span>
      </Link>
    </Button>
  );
}
