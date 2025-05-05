"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import MomoRedirect from "@/components/ui/momo-redirect";
import { toast } from "sonner";

interface PaymentPendingCountdownProps {
  orderId: string;
  createdAt: string;
  token?: string;
  showCancelButton?: boolean;
}

export function PaymentPendingCountdown({
  orderId,
  createdAt,
  token,
  showCancelButton = false,
}: PaymentPendingCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderCancelled, setOrderCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notify = toast;

  // Tính thời gian còn lại (ms)
  useEffect(() => {
    const expireAt = new Date(
      new Date(createdAt).getTime() + 24 * 60 * 60 * 1000
    );
    const update = () => {
      const now = new Date();
      const diff = expireAt.getTime() - now.getTime();
      setTimeLeft(diff > 0 ? diff : 0);
      if (diff <= 0 && !orderCancelled) {
        // Gọi API hủy đơn nếu hết hạn
        fetch("/api/order/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, reason: "Quá hạn thanh toán" }),
        }).then(() => {
          setOrderCancelled(true);
        });
      }
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line
  }, [createdAt, orderId, orderCancelled]);

  useEffect(() => {
    if (orderCancelled) {
      notify.error("Đơn hàng đã bị hủy", {
        description:
          "Đơn hàng đã bị hủy do quá hạn thanh toán hoặc bạn đã hủy đơn hàng này.",
        duration: 2000,
      });
      setTimeout(() => window.location.reload(), 1500);
    }
  }, [orderCancelled, toast]);

  // Format thời gian còn lại
  const formatTime = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (orderCancelled) {
    return (
      <div className="text-red-600 font-semibold mt-4">
        Đơn hàng đã bị hủy do quá hạn thanh toán.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 mt-4">
      <div className="text-yellow-600 font-semibold">
        Chờ thanh toán trong {formatTime(timeLeft)}
      </div>
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
        disabled={loading || timeLeft === 0}
        className="w-full max-w-xs"
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
        disabled={loading || timeLeft === 0}
        className="w-full max-w-xs"
      >
        Đổi sang thanh toán COD
      </Button>
      {showCancelButton && timeLeft > 0 && (
        <Button
          variant="destructive"
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              await fetch("/api/order/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId,
                  reason: "Khách tự hủy khi chờ thanh toán",
                }),
              });
              setOrderCancelled(true);
            } catch (e) {
              setError("Không thể kết nối đến máy chủ");
            } finally {
              setLoading(false);
            }
          }}
          className="w-full max-w-xs"
        >
          Hủy đơn hàng
        </Button>
      )}
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      {payUrl && <MomoRedirect payUrl={payUrl} />}
    </div>
  );
}
