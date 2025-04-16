"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartContext } from "@/features/shop/cart/cart-provider";
import { useCheckout } from "@/features/shop/checkout/checkout-provider";
import { CheckoutSteps } from "./checkout-steps";
import { GuestInfoStep } from "./guest-info-step";
import { AddressStep } from "./address-step";
import { PaymentStep } from "./payment-step";
import { ReviewStep } from "./review-step";
import { OrderSummary } from "@/features/shop/checkout/components/order-summary";
import { EmptyCart } from "@/features/shop/cart/components/empty-cart";
import { useAuthQuery } from "@/features/auth/hooks";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

export function CheckoutPage() {
  const router = useRouter();
  const { toast } = useSonnerToast();
  const { cartItemCount } = useCartContext();
  const { currentStep, justPlacedOrder } = useCheckout();
  const { data: session } = useAuthQuery();
  const isAuthenticated = !!session?.user;

  // Check if cart is empty and redirect to cart page if it is
  useEffect(() => {
    if (cartItemCount === 0 && !justPlacedOrder) {
      toast("Giỏ hàng trống", {
        description:
          "Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.",
      });
      router.push("/gio-hang");
    }
  }, [cartItemCount, router, toast, justPlacedOrder]);

  if (cartItemCount === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="container py-8 px-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Checkout steps */}
          <CheckoutSteps />

          {/* Guest info step (only for non-authenticated users) */}
          {!isAuthenticated && currentStep === "address" && <GuestInfoStep />}

          {/* Address step */}
          {currentStep === "address" && <AddressStep />}

          {/* Payment step */}
          {currentStep === "payment" && <PaymentStep />}

          {/* Review step */}
          {currentStep === "review" && <ReviewStep />}
        </div>

        {/* Order summary */}
        <div>
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
