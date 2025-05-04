"use client";

import { useEffect, useState } from "react";
import { useCheckout } from "@/features/shop/checkout/checkout-provider";
import { useSearchParams, usePathname } from "next/navigation";
import { getOrderDetails } from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function OrderGuestEmailForm({
  orderId,
  accessToken,
  onSuccess,
}: {
  orderId: string | number;
  accessToken: string;
  onSuccess?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!email) {
      setError("Vui lòng nhập email hợp lệ.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/order/send-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: accessToken, orderId }),
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

export function OrderConfirmationClient(
  props: {
    orderPaymentMethod?: string;
    orderUserId?: string;
    orderCustomerEmail?: string;
    orderGuestEmail?: string;
  } = {}
) {
  const { setJustPlacedOrder, justPlacedOrder } = useCheckout();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const orderId = searchParams.get("orderId");
  const token = searchParams.get("token");
  const [showGuestEmailForm, setShowGuestEmailForm] = useState(false);
  const [mailSent, setMailSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [orderDetails, setOrderDetails] = useState<any>(null);

  // Helper: unique key for this order (orderId hoặc accessToken)
  const orderKey =
    orderId || token ? `order_mail_sent_${orderId || token}` : null;

  // Khi mount, kiểm tra localStorage xem đã gửi mail cho order này chưa
  useEffect(() => {
    if (!orderKey) return;
    if (typeof window !== "undefined") {
      const sent = localStorage.getItem(orderKey);
      if (sent === "1") setMailSent(true);
    }
  }, [orderKey]);

  // Khi gửi mail thành công, lưu vào localStorage
  useEffect(() => {
    if (mailSent && orderKey && typeof window !== "undefined") {
      localStorage.setItem(orderKey, "1");
    }
  }, [mailSent, orderKey]);

  useEffect(() => {
    setJustPlacedOrder(false);
  }, [setJustPlacedOrder]);

  // Xác định có phải trang xác nhận đơn hàng (KHÔNG phải tra cứu)
  const isOrderConfirmationPage = pathname?.startsWith("/xac-nhan-don-hang");
  const isMomoConfirmationPage = pathname?.startsWith(
    "/xac-nhan-don-hang-momo"
  );

  useEffect(() => {
    async function checkAndSendMail() {
      // Kiểm tra truyền đủ thông tin orderId hoặc token
      if (!token && !orderId) {
        setError("Thiếu orderId hoặc token để tra cứu đơn hàng.");
        return;
      }
      const result = await getOrderDetails(token || orderId, !!token);
      setOrderDetails(result?.data || null);

      // Kiểm tra dữ liệu trả về từ API đã đủ chưa
      if (!result?.data) {
        setError("Không lấy được thông tin đơn hàng từ server.");
        setShowGuestEmailForm(false);
        return;
      }

      // 1. Khách đã đăng nhập (COD hoặc Momo): KHÔNG hiện form nhập email, chỉ gửi mail khi vừa đặt hàng xong, đã thanh toán thành công và trạng thái hợp lệ
      if (result?.success && result.data && result.data.user_id) {
        setShowGuestEmailForm(false); // <-- LUÔN ẨN FORM nếu là khách đã đăng nhập

        const paidStatuses = [
          "Đã xác nhận",
          "Đang xử lý",
          "Đang giao",
          "Đã giao",
          "Đã hoàn thành",
        ];
        if (
          result.data.customer_email &&
          result.data.customer_email !== "" &&
          (result.data.payment_status === "Paid" ||
            result.data.payment_status === "Pending") &&
          justPlacedOrder &&
          !mailSent &&
          paidStatuses.includes(result.data.status)
        ) {
          setSending(true);
          const lookupUrl = `http://localhost:3000/tra-cuu-don-hang?orderId=${result.data.id}&token=${result.data.access_token}`;
          const res = await fetch("/api/order/send-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: result.data.customer_email,
              token: result.data.access_token,
              orderId: result.data.id,
              orderNumber: result.data.order_number,
              lookupUrl,
            }),
          });
          const data = await res.json();
          setSending(false);
          if (data.success) setMailSent(true);
          else setError(data.error || "Gửi email thất bại");
        }
        return;
      }

      // 2. Khách vãng lai - Momo: gửi mail khi vừa đặt hàng xong, đã thanh toán thành công (Paid), đã có guest_email
      if (
        result?.success &&
        result.data &&
        !result.data.user_id &&
        result.data.guest_email &&
        result.data.guest_email !== "" &&
        result.data.payment_method === "Momo QR" &&
        result.data.payment_status === "Paid" &&
        justPlacedOrder &&
        !mailSent
      ) {
        setSending(true);
        const lookupUrl = `http://localhost:3000/tra-cuu-don-hang?orderId=${result.data.id}&token=${result.data.access_token}`;
        const res = await fetch("/api/order/send-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: result.data.guest_email,
            token: result.data.access_token,
            orderId: result.data.id,
            orderNumber: result.data.order_number,
            lookupUrl,
          }),
        });
        const data = await res.json();
        setSending(false);
        if (data.success) setMailSent(true);
        else setError(data.error || "Gửi email thất bại");
        setShowGuestEmailForm(false);
        return;
      }

      // 3. Khách vãng lai - COD: gửi mail khi vừa đặt hàng xong, trạng thái thanh toán là Pending, đã có guest_email
      if (
        result?.success &&
        result.data &&
        !result.data.user_id &&
        result.data.guest_email &&
        result.data.guest_email !== "" &&
        result.data.payment_method === "COD" &&
        result.data.payment_status === "Pending" &&
        justPlacedOrder &&
        !mailSent
      ) {
        setSending(true);
        const lookupUrl = `http://localhost:3000/tra-cuu-don-hang?orderId=${result.data.id}&token=${result.data.access_token}`;
        const res = await fetch("/api/order/send-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: result.data.guest_email,
            token: result.data.access_token,
            orderId: result.data.id,
            orderNumber: result.data.order_number,
            lookupUrl,
          }),
        });
        const data = await res.json();
        setSending(false);
        if (data.success) setMailSent(true);
        else setError(data.error || "Gửi email thất bại");
        setShowGuestEmailForm(false);
        return;
      }

      // GỬI EMAIL TỰ ĐỘNG CHO KHÁCH VÃNG LAI (COD/MOMO) nếu đã có guest_email, vừa đặt hàng xong, trạng thái thanh toán là 'Paid' HOẶC 'Pending'
      if (
        result?.success &&
        result.data &&
        !result.data.user_id &&
        result.data.guest_email &&
        result.data.guest_email !== "" &&
        (result.data.payment_status === "Paid" ||
          result.data.payment_status === "Pending") &&
        justPlacedOrder &&
        !mailSent
      ) {
        setSending(true);
        const lookupUrl = `http://localhost:3000/tra-cuu-don-hang?orderId=${result.data.id}&token=${result.data.access_token}`;
        const res = await fetch("/api/order/send-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: result.data.guest_email,
            token: result.data.access_token,
            orderId: result.data.id,
            orderNumber: result.data.order_number,
            lookupUrl,
          }),
        });
        const data = await res.json();
        setSending(false);
        if (data.success) setMailSent(true);
        else setError(data.error || "Gửi email thất bại");
        setShowGuestEmailForm(false);
        return;
      }

      // 4. Khách vãng lai: hiện form nhập email nếu ở trang xác nhận, đã thanh toán (Paid với Momo, Pending với COD), chưa có email, chưa gửi mail
      if (
        isOrderConfirmationPage &&
        !isMomoConfirmationPage &&
        result?.success &&
        result.data &&
        !result.data.user_id &&
        !result.data.customer_email &&
        !result.data.guest_email &&
        ((result.data.payment_method === "Momo QR" &&
          result.data.payment_status === "Paid") ||
          (result.data.payment_method === "COD" &&
            result.data.payment_status === "Pending"))
      ) {
        if (!mailSent) setShowGuestEmailForm(true);
        else setShowGuestEmailForm(false);
      } else {
        setShowGuestEmailForm(false);
      }
    }
    checkAndSendMail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, token, justPlacedOrder, mailSent, pathname]);

  if (mailSent) {
    return (
      <div className="my-4 text-green-600">
        Đã gửi thông tin đơn hàng về email của bạn!
      </div>
    );
  }
  if (sending) {
    return <div className="my-4">Đang gửi email xác nhận đơn hàng...</div>;
  }
  if (error) {
    return <div className="my-4 text-red-600">{error}</div>;
  }
  // Chỉ hiện form nếu là guest, ở trang xác nhận, đã thanh toán, chưa có email, chưa gửi mail
  if (showGuestEmailForm && orderDetails && !mailSent) {
    return (
      <OrderGuestEmailForm
        orderId={orderDetails.id}
        accessToken={orderDetails.access_token}
        onSuccess={() => setMailSent(true)}
      />
    );
  }
  return null;
}
