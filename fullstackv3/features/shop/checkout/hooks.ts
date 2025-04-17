import { useState } from "react";
import { markOrderPaidAction } from "./actions";

export function useMomoPayment(orderId: number, amount: number) {
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "failed"
  >("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gọi API tạo yêu cầu thanh toán
  const createPayment = async () => {
    setLoading(true);
    setError(null);
    setQrCodeUrl(null);
    setPayUrl(null);
    setReferenceId(null);
    try {
      const res = await fetch("/api/checkout/momo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, amount }),
      });
      const data = await res.json();
      if (data.qrCodeUrl) {
        setQrCodeUrl(data.qrCodeUrl);
        setPayUrl(data.payUrl);
        setReferenceId(data.orderId || data.requestId || null);
        setStatus("pending");
      } else {
        setError(data.error || "Không tạo được thanh toán");
      }
    } catch (e) {
      setError("Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  // Gọi API kiểm tra trạng thái thanh toán
  const checkStatus = async () => {
    if (!referenceId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/checkout/momo?referenceId=${referenceId}`);
      const data = await res.json();
      if (data.status === "SUCCESSFUL") {
        setStatus("success");
        // Cập nhật DB
        await markOrderPaidAction(orderId, referenceId);
      } else if (data.status === "FAILED") {
        setStatus("failed");
      } else {
        setStatus("pending");
      }
    } catch (e) {
      setError("Lỗi kiểm tra trạng thái");
    } finally {
      setLoading(false);
    }
  };

  return {
    referenceId,
    qrCodeUrl,
    payUrl,
    status,
    loading,
    error,
    createPayment,
    checkStatus,
  };
}
