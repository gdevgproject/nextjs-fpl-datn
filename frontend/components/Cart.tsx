"use client";

import { useCart } from "@/context/CartContext";
import { useCartActions } from "@/hooks/useCartActions";
import Image from "next/image";

export default function Cart() {
  const { cart } = useCart();
  const { removeFromCart, updateQuantity } = useCartActions();

  if (cart.items.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>Giỏ hàng trống</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Giỏ hàng</h2>

      <div className="space-y-4">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-4 border-b pb-4">
            <div className="relative w-24 h-24">
              <Image
                src={item.product.images[0]}
                alt={item.product.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1">
              <h3 className="font-medium">{item.product.name}</h3>
              <p className="text-sm text-gray-500">
                Dung tích: {item.volume}ml
              </p>
              <p className="font-medium">${item.product.price}</p>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() =>
                    updateQuantity(item.id, Math.max(0, item.quantity - 1))
                  }
                  className="px-2 py-1 border rounded"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-2 py-1 border rounded"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-auto text-red-500"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <span>Tổng số lượng:</span>
          <span>{cart.totalQuantity}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Tổng tiền:</span>
          <span>${cart.totalAmount}</span>
        </div>
      </div>

      <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
        Thanh toán
      </button>
    </div>
  );
}
