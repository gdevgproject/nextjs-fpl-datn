import React from "react";

export default function ThanhToanThatBaiPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="rounded-full bg-red-100 p-4 mb-4">
        <svg
          width="48"
          height="48"
          fill="none"
          viewBox="0 0 24 24"
          stroke="red"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-2">Thanh toán thất bại</h1>
      <p className="mb-4">
        Đã có lỗi xảy ra hoặc giao dịch bị hủy. Vui lòng thử lại hoặc liên hệ hỗ
        trợ.
      </p>
      <a href="/" className="text-primary underline">
        Quay về trang chủ
      </a>
    </div>
  );
}
