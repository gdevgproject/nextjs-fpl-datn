"use client";

import { useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useTogglePaymentMethodActiveState } from "../hooks";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { MoreHorizontal, Pencil, PowerIcon } from "lucide-react";
import type { PaymentMethod } from "../types";

interface PaymentMethodsTableProps {
  data: PaymentMethod[];
  isLoading: boolean;
  onEdit: (paymentMethod: PaymentMethod) => void;
}

export function PaymentMethodsTable({
  data,
  isLoading,
  onEdit,
}: PaymentMethodsTableProps) {
  const toast = useSonnerToast();

  const togglePaymentMethodMutation = useTogglePaymentMethodActiveState();

  // Handle toggling active state
  const handleToggleActiveState = useCallback(
    async (paymentMethod: PaymentMethod) => {
      try {
        const newState = !paymentMethod.is_active;
        await togglePaymentMethodMutation.mutateAsync({
          id: paymentMethod.id!,
          isActive: newState,
        });

        toast.success(
          `Phương thức thanh toán đã ${
            newState ? "kích hoạt" : "vô hiệu hóa"
          } thành công`
        );
      } catch (error) {
        toast.error("Không thể thay đổi trạng thái phương thức thanh toán", {
          description: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        });
      }
    },
    [togglePaymentMethodMutation, toast]
  );

  // Render a loading state if data is being fetched
  if (isLoading) {
    return (
      <div className="w-full p-8 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  // Render an empty state if no data
  if (data.length === 0) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-muted-foreground">
          Không có phương thức thanh toán nào. Vui lòng thêm mới.
        </p>
      </div>
    );
  }

  // Render the table with data
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Tên phương thức</TableHead>
              <TableHead className="hidden md:table-cell">Mô tả</TableHead>
              <TableHead className="w-[130px] text-center">
                Trạng thái
              </TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((paymentMethod) => (
              <TableRow key={paymentMethod.id}>
                <TableCell className="font-medium">
                  {paymentMethod.id}
                </TableCell>
                <TableCell className="font-medium">
                  {paymentMethod.name}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {paymentMethod.description || "-"}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center items-center">
                    <Switch
                      checked={paymentMethod.is_active}
                      onCheckedChange={() =>
                        handleToggleActiveState(paymentMethod)
                      }
                      disabled={togglePaymentMethodMutation.isPending}
                      aria-label={`Đổi trạng thái ${paymentMethod.name}`}
                    />
                    <span className="ml-2 text-sm text-muted-foreground">
                      {paymentMethod.is_active
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        aria-label="Mở menu"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onEdit(paymentMethod)}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleActiveState(paymentMethod)}
                        className="cursor-pointer"
                      >
                        <PowerIcon className="mr-2 h-4 w-4" />
                        {paymentMethod.is_active ? "Vô hiệu hóa" : "Kích hoạt"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
