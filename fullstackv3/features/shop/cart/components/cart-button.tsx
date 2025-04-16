"use client";

import Link from "next/link";
import { memo } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartContext } from "@/features/shop/cart/cart-provider";

const CartButton = memo(function CartButton() {
  const { cartItemCount } = useCartContext();

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
        {cartItemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {cartItemCount > 99 ? "99+" : cartItemCount}
          </span>
        )}
        <span className="sr-only">Giỏ hàng</span>
      </Link>
    </Button>
  );
});

export { CartButton };
