"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { MinusIcon, PlusIcon, XIcon } from "lucide-react";
import { useCartActions } from "@/hooks/useCartActions";
import Link from "next/link";

export default function CartPage() {
  const { cart } = useCart();
  const { removeFromCart, updateQuantity } = useCartActions();

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold mb-4">Giỏ hàng trống</h2>
        <Link
          href="/products"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Danh sách sản phẩm */}
        <div className="lg:col-span-8">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-6 p-4 bg-white rounded-lg shadow-sm"
              >
                {/* Ảnh sản phẩm */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>

                {/* Thông tin sản phẩm */}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Dung tích: {item.volume}ml
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="p-2 hover:bg-gray-50"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 border-x">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.min(item.product.stock, item.quantity + 1)
                          )
                        }
                        className="p-2 hover:bg-gray-50"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${item.totalPrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${item.product.price.toFixed(2)} / sản phẩm
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tổng kết đơn hàng */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Tổng đơn hàng</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Tổng số lượng:</span>
                <span>{cart.totalQuantity} sản phẩm</span>
              </div>
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>${cart.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span>$0.00</span>
              </div>
              {cart.discountAmount && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span>-${cart.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3 font-medium text-lg flex justify-between">
                <span>Tổng cộng:</span>
                <span>
                  ${(cart.totalAmount - (cart.discountAmount || 0)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Mã giảm giá */}
            <div className="mt-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200">
                  Áp dụng
                </button>
              </div>
            </div>

            {/* Nút thanh toán */}
            <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700">
              Tiến hành thanh toán
            </button>

            <Link
              href="/products"
              className="w-full mt-4 block text-center text-blue-600 hover:text-blue-700"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
