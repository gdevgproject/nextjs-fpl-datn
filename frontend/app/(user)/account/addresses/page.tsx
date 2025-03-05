"use client";

import { AccountSidebar } from "@/components/account/sidebar";
import { Button } from "@/components/ui/button";
import { fetchUser } from "@/lib/mockData";
import { User } from "@/lib/mockData";
import { useState, useEffect } from "react";
import { MapPin, Plus, PenSquare, Trash2 } from "lucide-react";
import Link from "next/link";

export default function AccountAddressesPage() {
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
              <h1 className="text-2xl font-bold text-gray-800">Sổ địa chỉ</h1>
              <Link href="/account/addresses/new">
                <Button className="flex items-center gap-2">
                  <Plus size={20} />
                  Thêm địa chỉ mới
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {user.addresses.map((address) => (
                <div
                  key={address.id}
                  className={`border rounded-lg p-4 relative ${
                    user.defaultAddressId === address.id
                      ? "border-red-200 bg-red-50"
                      : "hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-gray-400" />
                        <span className="font-medium">
                          {user.defaultAddressId === address.id && (
                            <span className="text-red-600 text-sm font-medium mr-2">
                              [Mặc định]
                            </span>
                          )}
                          Địa chỉ {address.id}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        {address.street}, {address.city}
                      </p>
                      <p className="text-gray-600">
                        {address.state}, {address.country} {address.zipCode}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href="/account/addresses/[id]/edit"
                        as={`/account/addresses/${address.id}/edit`}
                      >
                        <Button variant="outline" size="sm" className="gap-2">
                          <PenSquare size={16} />
                          Sửa
                        </Button>
                      </Link>
                      {user.defaultAddressId !== address.id && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                            Xóa
                          </Button>
                          <Button variant="outline" size="sm">
                            Đặt làm mặc định
                          </Button>
                        </>
                      )}
                    </div>
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
