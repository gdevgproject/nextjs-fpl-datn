"use client";

import { useEffect, useState } from "react";
import { useCheckout } from "@/features/shop/checkout/checkout-provider";
import { useSearchParams } from "next/navigation";
import { getOrderDetails } from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { access } from "fs";

function OrderGuestEmailForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Lấy orderId và token từ URL mỗi lần submit (chắc chắn luôn lấy đúng giá trị mới nhất)
  const getOrderParams = () => {
    if (typeof window === "undefined")
      return { orderId: undefined, token: undefined };
    const params = new URLSearchParams(window.location.search);
    return {
      orderId: params.get("orderId") || undefined,
      token: params.get("token") || undefined,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Lấy lại token và orderId từ URL mỗi lần submit, log ra để debug
    let token, orderId;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      token = params.get("token");
      orderId = params.get("orderId");
      console.log("DEBUG token:", token, "orderId:", orderId);
    }
    if (!email || (!token && !orderId)) {
      setError("Vui lòng nhập email và đảm bảo có mã tra cứu đơn hàng.");
      setLoading(false);
      return;
    }
    try {
      // DEBUG: log params gửi lên API
      console.log("GỬI API /api/order/send-token", { email, token, orderId });
      const res = await fetch("/api/order/send-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        onSuccess?.();
      } else {
        setError(data.error || "Gửi email thất bại");
      }
    } catch (e) {
      setError("Gửi email thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="my-4 text-green-600">
        Đã gửi thông tin đơn hàng về email của bạn!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="my-4 flex flex-col gap-2 max-w-sm">
      <label htmlFor="guest-email" className="font-medium">
        Nhập email để nhận thông tin đơn hàng:
      </label>
      <Input
        id="guest-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="your@email.com"
        disabled={loading}
      />
      <Button type="submit" disabled={loading || !email} className="mt-2">
        {loading ? "Đang gửi..." : "Gửi thông tin đơn hàng"}
      </Button>
      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
    </form>
  );
}

export function OrderConfirmationClient() {
  const { setJustPlacedOrder, discountAmount, appliedDiscount } = useCheckout();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const token = searchParams.get("token");
  const [showGuestEmailForm, setShowGuestEmailForm] = useState(false);

  useEffect(() => {
    // Reset the justPlacedOrder flag when navigating to order confirmation page
    setJustPlacedOrder(false);
  }, [setJustPlacedOrder]);

  useEffect(() => {
    async function checkGuestNeedEmail() {
      if (!token && !orderId) return;
      const result = await getOrderDetails(token || orderId, !!token);
      if (
        result?.success &&
        result.data &&
        result.data.access_token && // là guest
        (!result.data.customer_email || result.data.customer_email === "")
      ) {
        setShowGuestEmailForm(true);
      } else {
        setShowGuestEmailForm(false);
      }
    }
    checkGuestNeedEmail();
  }, [orderId, token]);

  useEffect(() => {
    if (!orderId && !token) return;

    const identifier = orderId || token || "";

    // Log client-side information first
    console.log("CLIENT-SIDE VALUES (from checkout context):", {
      discountAmount,
      appliedDiscountId: appliedDiscount?.id,
      appliedDiscountCode: appliedDiscount?.code,
    });

    // Then fetch the actual order from database and compare
    const fetchOrder = async () => {
      try {
        const result = await getOrderDetails(identifier, !orderId);
        if (result.success && result.data) {
          console.log("SERVER-SIDE VALUES (from database):", {
            subtotal: result.data.subtotal,
            discount: result.data.discount,
            discount_code: result.data.discount_code,
            shipping_fee: result.data.shipping_fee,
            total: result.data.total,
            discount_id: result.data.discount_id,
            order_id: result.data.id,
            access_token: result.data.access_token,
          });

          // Check for discrepancies
          if (
            discountAmount > 0 &&
            (!result.data.discount || result.data.discount === 0)
          ) {
            console.error(
              "DISCOUNT DISCREPANCY DETECTED: Client shows discount but database doesn't"
            );
            console.error(
              "This suggests the database trigger might be overriding discount_amount"
            );
          }
        }
      } catch (error) {
        console.error("Error fetching order details for debugging:", error);
      }
    };

    fetchOrder();
  }, [orderId, token, discountAmount, appliedDiscount]);

  if (showGuestEmailForm) {
    return (
      <OrderGuestEmailForm
        orderId={orderId || undefined}
        token={token || undefined}
      />
    );
  }

  return null;
}
