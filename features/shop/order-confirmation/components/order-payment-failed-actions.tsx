"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import MomoRedirect from "@/components/ui/momo-redirect";

export function OrderPaymentFailedActions({
  orderId,
  token,
}: {
  orderId: string;
  token?: string;
}) {
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nếu đã có payUrl, tự động redirect sang MoMo
  if (payUrl) {
    return <MomoRedirect payUrl={payUrl} />;
  }

  return (
    <div className="flex flex-col items-center gap-3 mt-4">
      <Button
        onClick={async () => {
          setLoading(true);
          setError(null);
          try {
            const res = await fetch("/api/payment/momo", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId }),
            });
            const data = await res.json();
            if (data.payUrl) {
              setPayUrl(data.payUrl);
            } else {
              setError(data.error || "Không lấy được link thanh toán MoMo");
            }
          } catch (e) {
            setError("Không thể kết nối đến máy chủ");
          } finally {
            setLoading(false);
          }
        }}
        className="w-full max-w-xs"
        disabled={loading}
      >
        {loading ? "Đang tạo link MoMo..." : "Thanh toán lại với MoMo"}
      </Button>
      <Button
        variant="outline"
        onClick={async () => {
          setLoading(true);
          setError(null);
          try {
            const res = await fetch("/api/order/change-to-cod", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId, token }),
            });
            const data = await res.json();
            if (data.success) {
              window.location.reload();
            } else {
              setError(data.error || "Không đổi được sang COD");
            }
          } catch (e) {
            setError("Không thể kết nối đến máy chủ");
          } finally {
            setLoading(false);
          }
        }}
        className="w-full max-w-xs"
        disabled={loading}
      >
        Đổi sang thanh toán COD
      </Button>
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </div>
  );
}
