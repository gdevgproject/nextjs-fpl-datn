"use client";

import { AccountSidebar } from "@/components/account/sidebar";
import { Button } from "@/components/ui/button";
import { fetchUser } from "@/lib/mockData";
import { User, FavoriteProduct } from "@/lib/mockData";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart } from "lucide-react";

export default function AccountFavoritesPage() {
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
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                  Sản phẩm yêu thích ({user.favorites?.length || 0})
                </h1>
              </div>

              {user.favorites && user.favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.favorites.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-48">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-800 mb-2">
                          {product.name}
                        </h3>
                        <p className="text-red-600 font-bold mb-4">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(product.price)}
                        </p>
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Xóa
                          </Button>
                          <Button size="sm" className="gap-2">
                            <ShoppingCart size={16} />
                            Thêm vào giỏ
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    Bạn chưa có sản phẩm yêu thích nào
                  </p>
                  <Link href="/products">
                    <Button>Xem sản phẩm</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
