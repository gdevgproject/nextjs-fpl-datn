"use client";

import { AccountSidebar } from "@/components/account/sidebar";
import { fetchUser } from "@/lib/mockData";
import { User } from "@/lib/mockData";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PenSquare } from "lucide-react";

export default function ProfilePage() {
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
          <div className="space-y-6">
            {/* Thông tin cơ bản */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                  Thông tin tài khoản
                </h1>
                <Link href="/account/profile/edit">
                  <Button variant="outline" className="flex items-center gap-2">
                    <PenSquare size={16} />
                    Chỉnh sửa
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-6 mb-8">
                <div className="shrink-0">
                  <img
                    className="h-24 w-24 object-cover rounded-full"
                    src="/avatar-placeholder.png"
                    alt="Avatar"
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">Mã: {user.user_code}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Họ và tên</p>
                  <p className="font-medium">{user.name}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium">{user.phone}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Ngày tham gia</p>
                  <p className="font-medium">
                    {new Date(user.registered_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>

            {/* Thống kê đơn hàng */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Thống kê đơn hàng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Tổng số đơn hàng</p>
                  <p className="text-2xl font-bold">{user.totalOrders}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Tổng chi tiêu</p>
                  <p className="text-2xl font-bold">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(user.totalSpent)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
