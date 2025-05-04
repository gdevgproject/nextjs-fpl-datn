"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthQuery } from "@/features/auth/hooks";

export default function ShipperPage() {
  const { data: session, isLoading } = useAuthQuery();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Chào mừng, Shipper!</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng chờ giao</CardTitle>
            <CardDescription>Danh sách đơn hàng đang chờ giao</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">0</p>
            <Button className="mt-4 w-full" asChild>
              <Link href="/shipper/don-hang">Xem đơn hàng</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng đang giao</CardTitle>
            <CardDescription>Danh sách đơn hàng đang giao</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">0</p>
            <Button className="mt-4 w-full" asChild>
              <Link href="/shipper/don-hang-dang-giao">Xem chi tiết</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng đã giao</CardTitle>
            <CardDescription>
              Danh sách đơn hàng đã giao hôm nay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">0</p>
            <Button className="mt-4 w-full" asChild>
              <Link href="/shipper/don-hang-da-giao">Xem chi tiết</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
