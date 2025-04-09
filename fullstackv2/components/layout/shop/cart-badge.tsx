"use client";

import { memo, useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/features/shop/cart/context/cart-context";

function CartBadgeComponent() {
  const { itemCount, isLoading } = useCart();
  const [animateCount, setAnimateCount] = useState(false);

  // Track previous count to animate when it changes
  const [prevCount, setPrevCount] = useState(itemCount);

  useEffect(() => {
    if (itemCount !== prevCount) {
      setAnimateCount(true);
      const timer = setTimeout(() => setAnimateCount(false), 300);
      setPrevCount(itemCount);
      return () => clearTimeout(timer);
    }
  }, [itemCount, prevCount]);

  // Use a key for the badge to trigger animation when count changes
  const badgeKey = useMemo(() => `cart-count-${itemCount}`, [itemCount]);

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href="/gio-hang">
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <Badge
            className={`absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs ${
              animateCount
                ? "animate-bounce"
                : "animate-in fade-in duration-300"
            }`}
            key={badgeKey}
          >
            {isLoading ? "..." : itemCount}
          </Badge>
        )}
        <span className="sr-only">Giỏ hàng</span>
      </Link>
    </Button>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const CartBadge = memo(CartBadgeComponent);
