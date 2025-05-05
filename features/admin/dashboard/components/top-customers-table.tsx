"use client";

import { TopCustomer } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { UsersIcon } from "lucide-react";

interface TopCustomersTableProps {
  customers: TopCustomer[];
}

export function TopCustomersTable({ customers }: TopCustomersTableProps) {
  // Helper function to get initials from name
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (!customers || customers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Khách Hàng Chi Tiêu Nhiều Nhất</CardTitle>
          <CardDescription>
            Khách hàng chi tiêu nhiều nhất trong khoảng thời gian đã chọn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <p className="text-muted-foreground">Không có dữ liệu</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Top Khách Hàng Chi Tiêu Nhiều Nhất</CardTitle>
            <CardDescription>
              Khách hàng chi tiêu nhiều nhất trong khoảng thời gian đã chọn
            </CardDescription>
          </div>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead className="text-right">Đơn hàng</TableHead>
              <TableHead className="text-right">Tổng chi tiêu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    {customer.avatarUrl ? (
                      <AvatarImage
                        src={customer.avatarUrl}
                        alt={customer.name}
                      />
                    ) : null}
                    <AvatarFallback>
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{customer.name}</span>
                    {customer.email && (
                      <span className="text-xs text-muted-foreground">
                        {customer.email}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {customer.type === "registered" ? (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-50"
                    >
                      Đã đăng ký
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 hover:bg-amber-50"
                    >
                      Khách vãng lai
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {customer.orderCount}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatPrice(customer.totalSpent)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
