"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Order } from "@/lib/mockData";
import { mockOrder } from "@/lib/mockOrderData";

export default function OrderPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập API call
    //   const fetchOrder = async () => {
    //     try {
    //       setLoading(true)
    //       // Thay thế bằng API call thực tế
    //       const response = await fetch(`/api/orders/${orderId}`)
    //       const data = await response.json()
    //       setOrder(data)
    //     } catch (error) {
    //       console.error("Lỗi khi tải đơn hàng:", error)
    //     } finally {
    //       setLoading(false)
    //     }
    //   }

    //   fetchOrder()
    // }, [orderId])
    const fetchOrder = async () => {
      try {
        setLoading(true);
        // Sử dụng dữ liệu giả
        setTimeout(() => {
          setOrder(mockOrder as unknown as Order);
          setLoading(false);
        }, 1000); // Giả lập delay 1 giây
      } catch (error) {
        console.error("Lỗi khi tải đơn hàng:", error);
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Không tìm thấy đơn hàng
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Thông tin đơn hàng */}
        <div className="border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Chi tiết đơn hàng #{order.order_code}
          </h1>
          <div className="mt-2 text-gray-600">
            <p>
              Ngày đặt hàng:{" "}
              {new Date(order.created_at).toLocaleDateString("vi-VN")}
            </p>
            <p className="mt-1">
              Trạng thái:
              <span
                className={`ml-2 px-3 py-1 rounded-full text-sm font-medium
                ${
                  order.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : order.status === "processing"
                    ? "bg-blue-100 text-blue-800"
                    : order.status === "shipped"
                    ? "bg-indigo-100 text-indigo-800"
                    : order.status === "delivered"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {order.status === "pending"
                  ? "Chờ xử lý"
                  : order.status === "processing"
                  ? "Đang xử lý"
                  : order.status === "shipped"
                  ? "Đang giao hàng"
                  : order.status === "delivered"
                  ? "Đã giao hàng"
                  : "Đã hủy"}
              </span>
            </p>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Sản phẩm đã đặt</h2>
          {order.products.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center border-b py-4"
            >
              <div className="h-24 w-24 flex-shrink-0">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  width={96}
                  height={96}
                  className="rounded-md object-cover"
                />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium">{item.product.name}</h3>
                <p className="text-gray-600">
                  {item.quantity} x{" "}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(item.product.price)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(item.product.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tổng tiền */}
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between text-base font-medium">
            <p>Tạm tính</p>
            <p>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(order.totalAmount)}
            </p>
          </div>
          <div className="flex justify-between text-base font-medium mt-2">
            <p>Phí vận chuyển</p>
            <p>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(30000)}
            </p>
          </div>
          <div className="flex justify-between text-lg font-bold mt-4">
            <p>Tổng cộng</p>
            <p className="text-red-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(order.totalAmount + 30000)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
