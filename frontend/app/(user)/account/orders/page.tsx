"use client";

import { AccountSidebar } from "@/components/account/sidebar";
import { Button } from "@/components/ui/button";
import { fetchUser } from "@/lib/mockData";
import { User } from "@/lib/mockData";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const orders = [
  {
    id: "DH001",
    date: "2024-03-01",
    total: 2500000,
    status: "completed",
    items: [
      {
        name: "Áo thun nam",
        quantity: 2,
        price: 250000,
        image: "/products/product-1.jpg",
      },
      {
        name: "Quần jean nam",
        quantity: 1,
        price: 2000000,
        image: "/products/product-2.jpg",
      },
    ],
  },
  // Thêm các đơn hàng mẫu khác...
];

const statusMap = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  shipping: "Đang giao hàng",
  completed: "Đã giao hàng",
  cancelled: "Đã hủy",
};

export default function AccountOrdersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await fetchUser("user2");
      setUser(userData as User);
      setLoading(false);
    };
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <AccountSidebar user={user} />
        </div>

        <div className="lg:col-span-9">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Đơn hàng của tôi
              </h1>
              <div className="flex gap-2">
                {Object.entries(statusMap).map(([key, value]) => (
                  <Button
                    key={key}
                    variant="outline"
                    className={cn(
                      "text-sm",
                      key === "completed" &&
                        "bg-red-50 text-red-600 border-red-200"
                    )}
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-4 hover:border-red-200 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold">Đơn hàng #{order.id}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.date).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(order.total)}
                      </p>
                      <p className="text-sm text-green-600">
                        {statusMap[order.status as keyof typeof statusMap]}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded">
                          {/* Add Image component here */}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            SL: {item.quantity} x{" "}
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      Chi tiết đơn hàng
                    </Button>
                    <Button variant="outline" size="sm">
                      Mua lại
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
