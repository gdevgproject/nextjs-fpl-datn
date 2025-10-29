import React from "react";

export default function ThanhToanThanhCongPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="rounded-full bg-green-100 p-4 mb-4">
        <svg
          width="48"
          height="48"
          fill="none"
          viewBox="0 0 24 24"
          stroke="green"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-2">Thanh toán thành công!</h1>
      <p className="mb-4">
        Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được thanh toán thành công
        qua MoMo.
      </p>
      <a href="/" className="text-primary underline">
        Quay về trang chủ
      </a>
    </div>
  );
}
