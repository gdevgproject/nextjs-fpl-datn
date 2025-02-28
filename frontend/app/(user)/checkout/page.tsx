"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { LoadingOverlay } from "@/components/LoadingOverlay";

interface ShippingFormData {
  fullName: string;
  phoneNumber: string;
  address: string;
  notes?: string;
}

export default function CheckoutPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormData>();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: ShippingFormData) => {
    try {
      // Show loading state
      setIsLoading(true);

      // API call to submit order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingDetails: data,
          paymentMethod,
          orderItems: useCart, // From your cart state
        }),
      });

      if (!response.ok) throw new Error("Order submission failed");

      router.push("/order-success");
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Shipping Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Họ tên */}
            <div role="group" aria-labelledby="personal-info">
              <label
                htmlFor="fullName"
                className="block text-sm font-medium mb-1"
              >
                Họ và tên
              </label>
              <input
                id="fullName"
                {...register("fullName", {
                  required: "Vui lòng nhập họ tên",
                  minLength: {
                    value: 2,
                    message: "Họ tên phải có ít nhất 2 ký tự",
                  },
                })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
                aria-invalid={errors.fullName ? "true" : "false"}
                aria-describedby={
                  errors.fullName ? "fullName-error" : undefined
                }
              />
              {errors.fullName && (
                <p
                  id="fullName-error"
                  className="text-red-500 text-sm mt-1"
                  role="alert"
                >
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Số điện thoại */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium mb-1"
              >
                Số điện thoại
              </label>
              <input
                id="phoneNumber"
                type="tel"
                {...register("phoneNumber", {
                  required: "Vui lòng nhập số điện thoại",
                  pattern: {
                    value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
                    message: "Số điện thoại không hợp lệ",
                  },
                })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors ${
                  errors.phoneNumber ? "border-red-500" : "border-gray-300"
                }`}
                aria-invalid={errors.phoneNumber ? "true" : "false"}
                aria-describedby={
                  errors.phoneNumber ? "phoneNumber-error" : undefined
                }
              />
              {errors.phoneNumber && (
                <p
                  id="phoneNumber-error"
                  className="text-red-500 text-sm mt-1"
                  role="alert"
                >
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Địa chỉ */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium mb-1"
              >
                Địa chỉ giao hàng
              </label>
              <textarea
                id="address"
                {...register("address", {
                  required: "Vui lòng nhập địa chỉ giao hàng",
                  minLength: {
                    value: 10,
                    message: "Địa chỉ phải đầy đủ và chi tiết",
                  },
                })}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors ${
                  errors.address ? "border-red-500" : "border-gray-300"
                }`}
                aria-invalid={errors.address ? "true" : "false"}
                aria-describedby={errors.address ? "address-error" : undefined}
              />
              {errors.address && (
                <p
                  id="address-error"
                  className="text-red-500 text-sm mt-1"
                  role="alert"
                >
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Ghi chú */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-1">
                Ghi chú
              </label>
              <textarea
                id="notes"
                {...register("notes")}
                rows={2}
                placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Phương thức thanh toán */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">
                Phương thức thanh toán
              </h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    value="banking"
                    checked={paymentMethod === "banking"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span>Chuyển khoản ngân hàng</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    value="momo"
                    checked={paymentMethod === "momo"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span>Ví MoMo</span>
                </label>
              </div>
            </div>

            {/* Nút đặt hàng */}
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors relative"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Đang xử lý...
                </div>
              ) : (
                "Đặt hàng"
              )}
            </button>
          </form>
        </div>

        {/* Order Summary & Payment */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>2,000,000₫</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span>30,000₫</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Amount:</span>
                  <span className="text-red-600">2,030,000₫</span>
                </div>
              </div>
            </div>
          </div>

          {/* <button
            className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            onClick={() => {
              // Handle order submission
              console.log("Order placed");
              router.push("/order-success");
            }}
          >
            Place Order
          </button> */}
        </div>
      </div>
      {isLoading && <LoadingOverlay />}
    </div>
  );
}
