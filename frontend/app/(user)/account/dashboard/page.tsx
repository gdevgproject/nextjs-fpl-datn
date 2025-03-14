"use client";

import { useState, useEffect } from "react";
import { User } from "@/lib/mockData";
import { fetchUser } from "@/lib/mockData";
import { AccountSidebar } from "@/components/account/sidebar";
import Link from "next/link";

export default function AccountDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await fetchUser("user2"); // Lấy user mẫu từ mockData
        setUser(userData as User);
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
      } finally {
        setLoading(false);
      }
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
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <AccountSidebar user={user} />

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Tổng đơn hàng</h3>
              <p className="text-2xl font-bold mt-2">{user.totalOrders}</p>
              <Link
                href="/account/orders"
                className="text-red-600 text-sm hover:text-red-700 mt-2 inline-block"
              >
                Xem chi tiết →
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Tổng chi tiêu</h3>
              <p className="text-2xl font-bold mt-2">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(user.totalSpent)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Ngày tham gia</h3>
              <p className="text-2xl font-bold mt-2">
                {new Date(user.registered_at).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>

          {/* Latest Order */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Đơn hàng gần đây</h3>
              <Link
                href="/account/orders"
                className="text-sm text-red-600 hover:text-red-700"
              >
                Xem tất cả
              </Link>
            </div>
            {/* Order list will be added here */}
          </div>

          {/* Default Address */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Địa chỉ mặc định</h3>
              <Link
                href="/account/addresses"
                className="text-sm text-red-600 hover:text-red-700"
              >
                Quản lý địa chỉ
              </Link>
            </div>
            {user.addresses.length > 0 ? (
              <div>
                <p className="font-medium">{user.addresses[0].street}</p>
                <p className="text-gray-600 mt-1">
                  {user.addresses[0].city}, {user.addresses[0].state}
                </p>
                <p className="text-gray-600">{user.addresses[0].country}</p>
              </div>
            ) : (
              <p className="text-gray-500">Bạn chưa thêm địa chỉ nào</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
