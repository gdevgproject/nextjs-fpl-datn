"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { useDiscounts } from "../hooks/use-discounts";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { formatCurrency } from "@/lib/utils/format";

interface DiscountTableProps {
  search: string;
  onEdit: (discount: any) => void;
}

export function DiscountTable({ search, onEdit }: DiscountTableProps) {
  const toast = useSonnerToast();

  // Fetch discounts with pagination and search
  const { data, isLoading, isError } = useDiscounts({
    search,
  });

  const formatDate = (date: string | null) => {
    if (!date) return "Không giới hạn";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (discount: any) => {
    const now = new Date();

    if (!discount.is_active) {
      return (
        <Badge variant="outline" className="bg-muted">
          Không hoạt động
        </Badge>
      );
    }

    if (discount.end_date && new Date(discount.end_date) < now) {
      return <Badge variant="destructive">Hết hạn</Badge>;
    }

    if (discount.start_date && new Date(discount.start_date) > now) {
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-500">
          Sắp diễn ra
        </Badge>
      );
    }

    if (discount.remaining_uses !== null && discount.remaining_uses <= 0) {
      return <Badge variant="destructive">Hết lượt dùng</Badge>;
    }

    return (
      <Badge variant="success" className="bg-green-500">
        Đang hoạt động
      </Badge>
    );
  };

  const getDiscountValue = (discount: any) => {
    if (discount.discount_percentage) {
      return `${discount.discount_percentage}%${
        discount.max_discount_amount
          ? ` (tối đa ${formatCurrency(discount.max_discount_amount)})`
          : ""
      }`;
    } else if (discount.max_discount_amount) {
      return formatCurrency(discount.max_discount_amount);
    }
    return "Không xác định";
  };

  if (isLoading) {
    return <div className="text-center py-4">Đang tải...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-4 text-destructive">
        Đã xảy ra lỗi khi tải dữ liệu
      </div>
    );
  }

  const discounts = data?.data || [];

  if (discounts.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-muted/10">
        <p className="text-muted-foreground">Không tìm thấy mã giảm giá nào</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã giảm giá</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead>Giá trị</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Lượt sử dụng</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {discounts.map((discount) => (
            <TableRow key={discount.id}>
              <TableCell className="font-medium">{discount.code}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {discount.description || "—"}
              </TableCell>
              <TableCell>{getDiscountValue(discount)}</TableCell>
              <TableCell>
                {discount.start_date || discount.end_date ? (
                  <span>
                    {formatDate(discount.start_date)} -{" "}
                    {formatDate(discount.end_date)}
                  </span>
                ) : (
                  "Không giới hạn"
                )}
              </TableCell>
              <TableCell>
                {discount.max_uses !== null ? (
                  <span>
                    {discount.remaining_uses !== null
                      ? discount.remaining_uses
                      : 0}
                    /{discount.max_uses}
                  </span>
                ) : (
                  "Không giới hạn"
                )}
              </TableCell>
              <TableCell>{getStatusBadge(discount)}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(discount)}
                  title="Chỉnh sửa mã giảm giá"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Chỉnh sửa</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
